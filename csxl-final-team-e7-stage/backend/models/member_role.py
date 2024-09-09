"""Enum to define to role for organization member"""

from enum import Enum


class MemberRole(Enum):
    MEMBER = "MEMBER"
    LEADER = "LEADER"
    PENDING = "PENDING"
