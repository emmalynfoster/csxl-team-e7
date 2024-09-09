"""Enum definition for organization status for application-based/open/closed."""

from enum import Enum

class OrganizationStatus(Enum):
    OPEN = "OPEN"
    APPLICATION_BASED = "APPLICATION BASED"
    CLOSED = "CLOSED"