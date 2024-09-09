from backend.models.user import User
from .entity_base import EntityBase
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Self
from .user_entity import UserEntity
from .organization_entity import OrganizationEntity
from ..models.organization_member import NewOrganizationMember, OrganizationMember
from ..models.public_user import PublicUser
from ..models.member_role import MemberRole
from ..models.semester import Semester
from sqlalchemy import Enum as SQLAlchemyEnum


class OrganizationMemberEntity(EntityBase):
    """Serves as the association table or Organizations and Users"""

    __tablename__ = "organization_member"

    # The role of this member
    role: Mapped[MemberRole] = mapped_column(SQLAlchemyEnum(MemberRole))

    title: Mapped[str] = mapped_column(String, default="Member")

    # foreign key fields for connecting organizations and users
    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organization.id"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)

    year: Mapped[int] = mapped_column(Integer)
    semester: Mapped[Semester] = mapped_column(SQLAlchemyEnum(Semester))

    # relationship fields
    organization: Mapped["OrganizationEntity"] = relationship(back_populates="members")
    user: Mapped["UserEntity"] = relationship(back_populates="memberships")


    @classmethod
    def from_model(cls, model: OrganizationMember) -> Self:
        return cls(
            organization_id=model.organization.id,
            user_id=model.user.id,
            organization=OrganizationEntity.from_model(model.organization),
            year=model.year,
            semester=model.semester,
            user=UserEntity.from_model(model.user),
            role=model.role,
            title=model.title,
        )

    @classmethod
    def from_new_model(cls, model: NewOrganizationMember) -> Self:
        return cls(organization_id=model.organization_id, user_id=model.user_id)

    def to_model(self, subject: User | None = None) -> OrganizationMember:
        return OrganizationMember(
            user_id=self.user_id,
            organization_id=self.organization.id,
            user=self.user.to_model(),
            organization=self.organization.to_model(subject),
            year=self.year,
            semester=self.semester,
            role=self.role,
            title=self.title,
        )

    def to_flat_model(self) -> PublicUser:
        return PublicUser(
            id=self.user_id,
            first_name=self.user.first_name,
            last_name=self.user.last_name,
            pronouns=self.user.pronouns,
            email=self.user.email,
            github_avatar=self.user.github_avatar,
        )
