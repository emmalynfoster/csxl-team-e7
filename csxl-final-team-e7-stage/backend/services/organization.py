"""
The Organizations Service allows the API to manipulate organizations data in the database.
"""

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.entities.organization_member_entity import OrganizationMemberEntity
from backend.models.member_role import MemberRole
from backend.models.organization_status import OrganizationStatus
from backend.models.organization_member import OrganizationMember
from backend.models.permission import Permission
from backend.models.organization_status import OrganizationStatus
from backend.services.user import UserService

from ..database import db_session
from ..models.organization import Organization
from ..models.organization_details import OrganizationDetails
from ..entities.organization_entity import OrganizationEntity
from backend.models.public_user import PublicUser
from ..models import User
from .permission import PermissionService
from datetime import date
from ..models.semester import Semester

from .exceptions import (
    ResourceNotFoundException,
    UserPermissionException,
    DuplicateMemberException,
)


__authors__ = ["Ajay Gandecha", "Jade Keegan", "Brianna Ta", "Audrey Toney"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


class OrganizationService:
    """Service that performs all of the actions on the `Organization` table"""

    def __init__(
        self,
        session: Session = Depends(db_session),
        permission: PermissionService = Depends(),
        user_service: UserService = Depends(),
    ):
        """Initializes the `OrganizationService` session, and `PermissionService`"""
        self._session = session
        self._permission = permission
        self._user_service = user_service

    def all(self, subject: User | None = None) -> list[Organization]:
        """
        Retrieves all organizations from the table

        Returns:
            list[Organization]: List of all `Organization`
        """
        # Select all entries in `Organization` table
        query = select(OrganizationEntity)
        entities = self._session.scalars(query).all()

        # Convert entries to a model and return
        return [entity.to_model(subject) for entity in entities]

    def create(self, subject: User, organization: Organization) -> Organization:
        """
        Creates a organization based on the input object and adds it to the table.
        If the organization's ID is unique to the table, a new entry is added.
        If the organization's ID already exists in the table, it raises an error.

        Parameters:
            subject: a valid User model representing the currently logged in User
            organization (Organization): Organization to add to table

        Returns:
            Organization: Object added to table
        """

        # Check if user has admin permissions
        self._permission.enforce(subject, "organization.create", f"organization")

        # Checks if the organization already exists in the table
        if organization.id:
            # Set id to None so database can handle setting the id
            organization.id = None

        # Otherwise, create new object
        organization_entity = OrganizationEntity.from_model(organization)

        # Add new object to table and commit changes
        self._session.add(organization_entity)
        self._session.commit()

        # Return added object
        return organization_entity.to_model(subject)

    def get_by_slug(
        self, slug: str, subject: User | None = None
    ) -> OrganizationDetails:
        """
        Get the organization from a slug
        If none retrieved, a debug description is displayed.

        Parameters:
            slug: a string representing a unique organization slug

        Returns:
            Organization: Object with corresponding slug

        Raises:
            ResourceNotFoundException if no organization is found with the corresponding slug
        """

        # Query the organization with matching slug
        organization = (
            self._session.query(OrganizationEntity)
            .filter(OrganizationEntity.slug == slug)
            .one_or_none()
        )

        # Check if result is null
        if organization is None:
            raise ResourceNotFoundException(
                f"No organization found with matching slug: {slug}"
            )

        return organization.to_details_model(subject)
    
    def add_member(self, subject: User, user: User, organization: OrganizationDetails):
        """
        Add subject to organization from slug
        """
        if subject.id != user.id:
            self._permission.enforce(
                subject,
                "organization.update",
                f"organization/{organization.slug}",
            )

        existing_member = self.get_member(subject, user, organization)
        if existing_member:
            raise DuplicateMemberException(
                existing_member.organization.slug, existing_member.user.id # type: ignore
            )
        organization_member_entity = OrganizationMemberEntity(
            user_id=user.id, 
            organization_id=organization.id, 
            year=date.today().year, 
            semester=self._get_current_semeseter()
        )

        if organization.status == OrganizationStatus.OPEN.value:
            organization_member_entity.role = MemberRole.MEMBER
        elif organization.status == OrganizationStatus.APPLICATION_BASED.value:
            organization_member_entity.role = MemberRole.PENDING
        self._session.add(organization_member_entity)
        self._session.commit()

        return organization_member_entity.to_flat_model()

    def update_member(
        self, subject: User, member: OrganizationMember
    ) -> OrganizationMember:
        """
        Update member
        """
        self.enforce_orgmember_perms(subject, member.organization)

        existing_member = self._session.get(
            OrganizationMemberEntity, (member.organization.id, member.user.id)
        )

        if existing_member is None:
            raise ResourceNotFoundException(
                f"No member found with matching slug: {member.organization.slug} and user_id: {member.user.id}"
            )

        # only admin can promote / demote leaders
        if (
            existing_member.role == MemberRole.LEADER
            or member.role == MemberRole.LEADER
        ):
            self._permission.enforce(
                subject,
                "organization.update",
                f"organization/{member.organization.slug}",
            )
        existing_member.title = member.title
        existing_member.role = member.role

        self._session.commit()

        return existing_member.to_model()

    def delete_member(
        self, subject: User, user: User, organization: OrganizationDetails
    ):
        """
        Remove subject from organization from slug
        """
        if subject.id != user.id:
            self.enforce_orgmember_perms(subject, organization)

        organization_member = self.get_member(subject, user, organization)

        if organization_member is None:
            raise ResourceNotFoundException(
                f"No member found with matching slug: {organization.slug} and user_id: {user.id}"
            )

        # only admin can delete leaders
        if subject.id != user.id and organization_member.role == MemberRole.LEADER:
            self._permission.enforce(
                subject,
                "organization.update",
                f"organization/{organization_member.organization.slug}",
            )

        self._session.delete(
            self._session.get(OrganizationMemberEntity, (organization.id, user.id))
        )

        self._session.commit()

    def get_members(
        self, subject: User, organization: OrganizationDetails, pending: bool
    ) -> list[PublicUser]:
        """
        Get a list of members from one organization
        """
        self.enforce_orgmember_perms(subject, organization)

        # Query the organization with matching id
        organization_member_entities = (
            self._session.query(OrganizationMemberEntity)
            .where(OrganizationMemberEntity.organization_id == organization.id)
            # Filters to only pending if pending, everything except for pending if not
            .where((OrganizationMemberEntity.role == MemberRole.PENDING) == pending)
            .all()
        )

        return [entity.to_flat_model() for entity in organization_member_entities]

    def get_organizations_from_member(
        self, subject: User, user: User, pending: bool
    ) -> list[Organization]:
        """
        Get all organizations based on member to display in organizations tab
        """
        if subject.id != user.id:
            self._permission.enforce(subject, "user.update", f"user/{user.id}")

        organization_member_entities = (
            self._session.query(OrganizationMemberEntity)
            .where(OrganizationMemberEntity.user_id == user.id)
            # Filters to only pending if pending, everything except for pending if not
            .where((OrganizationMemberEntity.role == MemberRole.PENDING) == pending)
            .all()
        )

        return [entity.to_model().organization for entity in organization_member_entities]

    def get_member_for_status(
        self, subject: User, member_id: int, organization: OrganizationDetails
    ) -> PublicUser | None:
        """
        Get one member from one organization for frontend user status
        """

        organization_member_entity = (
            self._session.query(OrganizationMemberEntity)
            .where(OrganizationMemberEntity.user_id == member_id)
            .where(OrganizationMemberEntity.organization_id == organization.id)
            .one_or_none()
        )

        if organization_member_entity is not None:
            return organization_member_entity.to_flat_model()
        else:
            return None

    def get_member(
        self, subject: User, member: User, organization: OrganizationDetails
    ) -> OrganizationMember | None:
        """
        Get one member from one organization
        """
        organization_member_entity = (
            self._session.query(OrganizationMemberEntity)
            .where(OrganizationMemberEntity.user_id == member.id)
            .where(OrganizationMemberEntity.organization_id == organization.id)
            .one_or_none()
        )

        if organization_member_entity is not None:
            return organization_member_entity.to_model()
        else:
            return None

    def check_orgmember_perms(self, user: User, organization: Organization):
        """
        Checks if the user has perms to update the org members
        """
        if (
            self._permission.check(
                user, "organization.update", f"organization/{organization.slug}"
            )
            is True
        ):
            return True

        member = self.get_member(user, user, organization) # type: ignore
        return member is not None and member.role is MemberRole.LEADER

    def enforce_orgmember_perms(self, user: User, organization: Organization):
        """
        Raises exception if user doesnt have perms to update the org members
        """
        if self.check_orgmember_perms(user, organization) is False:
            raise UserPermissionException(
                "organization.update", f"organization/{organization.slug}"
            )

    def update(self, subject: User, organization: Organization) -> Organization:
        """
        Update the organization
        If none found with that id, a debug description is displayed.

        Parameters:
            subject: a valid User model representing the currently logged in User
            organization (Organization): Organization to add to table

        Returns:
            Organization: Updated organization object

        Raises:
            ResourceNotFoundException: If no organization is found with the corresponding ID
        """

        # Check if user has admin permissions
        self.enforce_orgmember_perms(subject, organization)

        # Query the organization with matching id
        obj = self._session.get(OrganizationEntity, organization.id)

        # Check if result is null
        if obj is None:
            raise ResourceNotFoundException(
                f"No organization found with matching ID: {organization.id}"
            )

        # Update organization object
        obj.name = organization.name
        obj.shorthand = organization.shorthand
        obj.slug = organization.slug
        obj.logo = organization.logo
        obj.short_description = organization.short_description
        obj.long_description = organization.long_description
        obj.join_description = organization.join_description
        obj.website = organization.website
        obj.email = organization.email
        obj.instagram = organization.instagram
        obj.linked_in = organization.linked_in
        obj.youtube = organization.youtube
        obj.heel_life = organization.heel_life
        obj.public = organization.public
        obj.status = OrganizationStatus(organization.status)
        obj.application_link = organization.application_link

        # Save changes
        self._session.commit()

        # Return updated object
        return obj.to_model(subject)

    def delete(self, subject: User, slug: str) -> None:
        """
        Delete the organization based on the provided slug.
        If no item exists to delete, a debug description is displayed.

        Parameters:
            subject: a valid User model representing the currently logged in User
            slug: a string representing a unique organization slug

        Raises:
            ResourceNotFoundException: If no organization is found with the corresponding slug
        """
        # Check if user has admin permissions
        self._permission.enforce(subject, "organization.delete", f"organization")

        # Find object to delete
        obj = (
            self._session.query(OrganizationEntity)
            .filter(OrganizationEntity.slug == slug)
            .one_or_none()
        )

        # Ensure object exists
        if obj is None:
            raise ResourceNotFoundException(
                f"No organization found with matching slug: {slug}"
            )

        # Delete object and commit
        self._session.delete(obj)
        # Save changes
        self._session.commit()
    
    def _get_current_semeseter(self):
        current_month = date.today().month

        if 1 <= current_month <= 5:
            return Semester.SPRING
        elif 6 <= current_month <= 7:
            return Semester.SUMMER
        elif 8 <= current_month <= 12:
            return Semester.FALL
    
