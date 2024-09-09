"""Contains mock data for the live demo of the members feature"""

import pytest
from sqlalchemy.orm import Session
from ....entities.organization_member_entity import OrganizationMemberEntity
from ....models.member_role import MemberRole
from .organization_demo_data import acm, appteam
from ..user_data import user, user_org_members, leader
from ....models.semester import Semester

member_one = OrganizationMemberEntity(
    organization_id=acm.id,
    user_id=user.id,
    role=MemberRole.PENDING,
    year = 2024,
    semester=Semester.SPRING
)

member_two = OrganizationMemberEntity(
    organization_id=acm.id,
    user_id=user_org_members.id,
    role=MemberRole.MEMBER,
    year = 2024,
    semester=Semester.SPRING
)
leader_org = OrganizationMemberEntity(
    user_id=leader.id,
    organization_id=appteam.id,
    year=2024,
    semester=Semester.SPRING,
    role=MemberRole.LEADER,
    title="President"
)

members = [member_one, member_two, leader_org]


def insert_fake_data(session: Session):
    """Inserts fake member data into the test session."""
    global members

    entities = []
    for member in members:
        session.add(member)
        entities.append(member)

    session.commit()


@pytest.fixture(autouse=True)
def fake_data_fixture(session: Session):
    """Insert fake data the session automatically when test is run.
    Note:
        This function runs automatically due to the fixture property `autouse=True`.
    """
    insert_fake_data(session)
    session.commit()
    yield
