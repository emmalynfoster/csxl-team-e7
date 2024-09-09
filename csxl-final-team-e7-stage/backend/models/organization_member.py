from pydantic import BaseModel
from .user import User
from .organization import Organization
from .member_role import MemberRole
from .semester import Semester


class NewOrganizationMember(BaseModel):
    """Pydantic model to represent an `OrganizationMember`.

    This model is based on the `OrganizationMemberEntity` model, which
    defines the shape of the `OrganizationMember` table in the PostgreSQL database
    """

    user_id: int
    organization_id: int
    year: int
    semester: Semester


class OrganizationMember(NewOrganizationMember):
    organization: Organization
    user: User
    role: MemberRole
    title: str
