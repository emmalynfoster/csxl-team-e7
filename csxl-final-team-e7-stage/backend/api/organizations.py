"""Organization API

Organization routes are used to create, retrieve, and update Organizations."""

from fastapi import APIRouter, Depends

from backend.services.user import UserService

from ..services import OrganizationService
from ..models.organization import Organization
from ..models.organization_details import OrganizationDetails
from ..models.organization_member import OrganizationMember
from ..api.authentication import registered_user
from ..models.user import User
from ..models.public_user import PublicUser

__authors__ = ["Ajay Gandecha", "Jade Keegan", "Brianna Ta", "Audrey Toney"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"

api = APIRouter(prefix="/api/organizations")
openapi_tags = {
    "name": "Organizations",
    "description": "Create, update, delete, and retrieve CS Organizations.",
}


@api.get("", response_model=list[Organization], tags=["Organizations"])
def get_organizations(
    organization_service: OrganizationService = Depends(),
) -> list[Organization]:
    """
    Get all organizations

    Parameters:
        organization_service: a valid OrganizationService

    Returns:
        list[Organization]: All `Organization`s in the `Organization` database table
    """

    # Return all organizations
    return organization_service.all()


@api.post("", response_model=Organization, tags=["Organizations"])
def new_organization(
    organization: Organization,
    subject: User = Depends(registered_user),
    organization_service: OrganizationService = Depends(),
) -> Organization:
    """
    Create organization

    Parameters:
        organization: a valid Organization model
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService

    Returns:
        Organization: Created organization

    Raises:
        HTTPException 422 if create() raises an Exception
    """

    return organization_service.create(subject, organization)


@api.get(
    "/{slug}",
    responses={404: {"model": None}},
    response_model=OrganizationDetails,
    tags=["Organizations"],
)
def get_organization_by_slug(
    slug: str, organization_service: OrganizationService = Depends()
) -> OrganizationDetails:
    """
    Get organization with matching slug

    Parameters:
        slug: a string representing a unique identifier for an Organization
        organization_service: a valid OrganizationService

    Returns:
        Organization: Organization with matching slug

    Raises:
        HTTPException 404 if get_by_slug() raises an Exception
    """

    return organization_service.get_by_slug(slug)


@api.put(
    "",
    responses={404: {"model": None}},
    response_model=Organization,
    tags=["Organizations"],
)
def update_organization(
    organization: Organization,
    subject: User = Depends(registered_user),
    organization_service: OrganizationService = Depends(),
) -> Organization:
    """
    Update organization

    Parameters:
        organization: a valid Organization model
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService

    Returns:
        Organization: Updated organization

    Raises:
        HTTPException 404 if update() raises an Exception
    """

    return organization_service.update(subject, organization)


@api.delete("/{slug}", response_model=None, tags=["Organizations"])
def delete_organization(
    slug: str,
    subject: User = Depends(registered_user),
    organization_service: OrganizationService = Depends(),
):
    """
    Delete organization based on slug

    Parameters:
        slug: a string representing a unique identifier for an Organization
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService

    Raises:
        HTTPException 404 if delete() raises an Exception
    """

    organization_service.delete(subject, slug)


@api.post("/{slug}/members", response_model=PublicUser, tags=["Organizations"])
def add_member_to_organization(
    slug: str,
    user_id: int = -1,
    subject: User = Depends(registered_user),
    user_service: UserService = Depends(),
    organization_service: OrganizationService = Depends(),
):
    """
    Add registered user to organization based on slug

    Parameters:
        slug: a string representing a unique identifier for an Organization
        user_id: an int representing the unique id for a User
        subject: a valid User model representing the currently logged in User
        user_service: a valid UserService
        organization_service: a valid OrganizationService
    """
    if user_id == -1 and subject.id is not None:
        user: User = subject
    else:
        user: User = user_service.get_by_id(user_id)

    organization: OrganizationDetails = organization_service.get_by_slug(slug)
    return organization_service.add_member(subject, user, organization)


@api.put("/members", response_model=OrganizationMember, tags=["Organizations"])
def update_member(
    member: OrganizationMember,
    subject: User = Depends(registered_user),
    organization_service: OrganizationService = Depends(),
):
    """
    Update organization member

    Parameters:
        member: a valid OrganizationMember
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService
    """
    return organization_service.update_member(subject, member)


@api.delete("/{slug}/members", response_model=None, tags=["Organizations"])
def remove_member_from_organization(
    slug: str,
    user_id: int = -1,
    subject: User = Depends(registered_user),
    user_service: UserService = Depends(),
    organization_service: OrganizationService = Depends(),
):
    """
    Remove registered user from organizagtion based on slug

    Parameters:
        slug: a string representing a unique identifier for an Organization
        user_id: an int representing the unique id for a User
        subject: a valid User model representing the currently logged in User
        user_service: a valid UserService
        organization_service: a valid OrganizationService
    """
    if user_id == -1 and subject.id is not None:
        user: User = subject
    else:
        user: User = user_service.get_by_id(user_id)

    organization: OrganizationDetails = organization_service.get_by_slug(slug)
    organization_service.delete_member(subject, user, organization)


@api.get(
    "/{slug}/member",
    response_model=OrganizationMember | None,
    tags=["Organizations"],
)
def get_member(
    slug: str,
    user_id: int = -1,
    subject: User = Depends(registered_user),
    user_service: UserService = Depends(),
    organization_service: OrganizationService = Depends(),
) -> OrganizationMember | None:
    """
    Get a specific members for the given organization

    Parameters:
        slug: a string representing a unique identifier for an Organization
        user_id: an int id that is unique to the user
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService
    """

    if user_id == -1 and subject.id is not None:
        user: User = subject
    else:
        user: User = user_service.get_by_id(user_id)

    organization: OrganizationDetails = organization_service.get_by_slug(slug)
    return organization_service.get_member(subject, user, organization)


@api.get("/{slug}/members", response_model=list[PublicUser], tags=["Organizations"])
def get_organization_members(
    slug: str,
    pending: bool = False,
    subject: User = Depends(registered_user),
    organization_service: OrganizationService = Depends(),
) -> list[PublicUser]:
    """
    Get all members for given organization

    Parameters:
        slug: a string representing a unique identifier for an Organization
        pending: a bool representing if only pending members or no pending members
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService
    """

    organization: OrganizationDetails = organization_service.get_by_slug(slug)
    return organization_service.get_members(subject, organization, pending)


@api.get(
    "/memberships/", response_model=list[Organization], tags=["Organizations"]
)
def get_user_memberships(
    user_id: int = -1,
    pending: bool = False,
    subject: User = Depends(registered_user),
    user_service: UserService = Depends(),
    organization_service: OrganizationService = Depends(),
) -> list[Organization]:
    """
    Get all memberships for registered user

    Parameters:
        user_id: an int representing the unique id for a User
        pending: a bool representing if only pending members or no pending members
        subject: a valid User model representing the currently logged in User
        user_service: a valid UserService
        organization_service: a valid OrganizationService
    """
    if user_id == -1 and subject.id is not None:
        user: User = subject
    else:
        user: User = user_service.get_by_id(user_id)

    return organization_service.get_organizations_from_member(subject, user, pending)