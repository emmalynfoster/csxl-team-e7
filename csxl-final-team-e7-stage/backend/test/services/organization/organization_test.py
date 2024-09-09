"""Tests for the OrganizationService class."""

# PyTest
import pytest
from unittest.mock import create_autospec

from backend.services.exceptions import (
    UserPermissionException,
    ResourceNotFoundException,
)

# Tested Dependencies
from ....models import Organization
from ....services import OrganizationService

# Injected Service Fixtures
from ..fixtures import organization_svc_integration

# Explicitly import Data Fixture to load entities in database
from ..core_data import setup_insert_data_fixture

# Data Models for Fake Data Inserted in Setup
from .organization_test_data import (
    organizations,
    to_add,
    cads,
    new_cads,
    to_add_conflicting_id,
    organization_member1,
    organization_member2,
    organization_member3,
)
from ..user_data import root, ambassador, user, user_org_members

__authors__ = ["Ajay Gandecha"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"

# Test Functions

# Test `OrganizationService.all()`


def test_get_all(organization_svc_integration: OrganizationService):
    """Test that all organizations can be retrieved."""
    fetched_organizations = organization_svc_integration.all()
    assert fetched_organizations is not None
    assert len(fetched_organizations) == len(organizations)
    assert isinstance(fetched_organizations[0], Organization)


# Test `OrganizationService.get_by_id()`


def test_get_by_slug(organization_svc_integration: OrganizationService):
    """Test that organizations can be retrieved based on their ID."""
    fetched_organization = organization_svc_integration.get_by_slug(cads.slug)
    assert fetched_organization is not None
    assert isinstance(fetched_organization, Organization)
    assert fetched_organization.slug == cads.slug


# Test `OrganizationService.get_members()`


def test_get_members(organization_svc_integration: OrganizationService):
    """Test that the service correctly returns a list of members for an organization using cads"""
    org_details = organization_svc_integration.get_by_slug(cads.slug)
    org_members = organization_svc_integration.get_members(user, org_details)
    assert len(org_members) == 2


# Test `OrganizationService.get_organizations_from_member()`


def test_get_organizations_from_member(
    organization_svc_integration: OrganizationService,
):
    """Test that the service correctly returns a list of organizations for user in cssg and cads"""
    member_orgs = organization_svc_integration.get_organizations_from_member(user, user)
    assert len(member_orgs) == 2


# Test 'OrganizationService.add_member()'


def test_add_member(organization_svc_integration: OrganizationService):
    """Test that the service correctly adds a user to the database"""
    organization_details = organization_svc_integration.get_by_slug(cads.slug)
    org_member = organization_svc_integration.add_member(root, organization_details)
    assert org_member is not None


def test_add_member_as_user_twice(organization_svc_integration: OrganizationService):
    organization_details = organization_svc_integration.get_by_slug(cads.slug)
    org_member_1 = organization_svc_integration.add_member(user, organization_details)
    assert org_member_1 is not None
    org_member_2 = organization_svc_integration.add_member(user, organization_details)
    assert org_member_2 is not None
    assert org_member_1 == org_member_2


# Test 'OrganizationService.delete_member()'


def test_delete_member(organization_svc_integration: OrganizationService):
    organization_details = organization_svc_integration.get_by_slug(cads.slug)
    assert (
        organization_svc_integration.get_member(user, user, organization_details)
        is not None
    )
    organization_svc_integration.delete_member(user, organization_details)
    assert (
        organization_svc_integration.get_member(user, user, organization_details)
        is None
    )


# Test `OrganizationService.create()`


def test_create_enforces_permission(organization_svc_integration: OrganizationService):
    """Test that the service enforces permissions when attempting to create an organization."""

    # Setup to test permission enforcement on the PermissionService.
    organization_svc_integration._permission = create_autospec(
        organization_svc_integration._permission
    )

    # Test permissions with root user (admin permission)
    organization_svc_integration.create(root, to_add)
    organization_svc_integration._permission.enforce.assert_called_with(
        root, "organization.create", "organization"
    )


def test_create_organization_as_root(organization_svc_integration: OrganizationService):
    """Test that the root user is able to create new organizations."""
    created_organization = organization_svc_integration.create(root, to_add)
    assert created_organization is not None
    assert created_organization.id is not None


def test_create_organization_id_already_exists(
    organization_svc_integration: OrganizationService,
):
    """Test that the root user is able to create new organizations when an extraneous ID is provided."""
    created_organization = organization_svc_integration.create(
        root, to_add_conflicting_id
    )
    assert created_organization is not None
    assert created_organization.id is not None


def test_create_organization_as_user(organization_svc_integration: OrganizationService):
    """Test that any user is *unable* to create new organizations."""
    with pytest.raises(UserPermissionException):
        organization_svc_integration.create(user, to_add)
        pytest.fail()  # Fail test if no error was thrown above


# Test `OrganizationService.update()`
def test_update_organization_as_root(
    organization_svc_integration: OrganizationService,
):
    """Test that the root user is able to update organizations.
    Note: Test data's website field is updated
    """
    organization_svc_integration.update(root, new_cads)
    assert (
        organization_svc_integration.get_by_slug("cads").website
        == "https://cads.cs.unc.edu/"
    )


def test_update_organization_as_user(organization_svc_integration: OrganizationService):
    """Test that any user is *unable* to update new organizations."""
    with pytest.raises(UserPermissionException):
        organization_svc_integration.update(user, new_cads)


def test_update_organization_does_not_exist(
    organization_svc_integration: OrganizationService,
):
    """Test updating an organization that does not exist."""
    with pytest.raises(ResourceNotFoundException):
        organization_svc_integration.update(root, to_add)


def test_delete_enforces_permission(organization_svc_integration: OrganizationService):
    """Test that the service enforces permissions when attempting to delete an organization."""

    # Setup to test permission enforcement on the PermissionService.
    organization_svc_integration._permission = create_autospec(
        organization_svc_integration._permission
    )

    # Test permissions with root user (admin permission)
    organization_svc_integration.delete(root, cads.slug)
    organization_svc_integration._permission.enforce.assert_called_with(
        root, "organization.delete", "organization"
    )


def test_delete_organization_as_root(organization_svc_integration: OrganizationService):
    """Test that the root user is able to delete organizations."""
    organization_svc_integration.delete(root, cads.slug)
    with pytest.raises(ResourceNotFoundException):
        organization_svc_integration.get_by_slug(cads.slug)


def test_delete_organization_as_user(organization_svc_integration: OrganizationService):
    """Test that any user is *unable* to delete organizations."""
    with pytest.raises(UserPermissionException):
        organization_svc_integration.delete(user, cads.slug)


def test_delete_organization_does_not_exist(
    organization_svc_integration: OrganizationService,
):
    """Test deleting an organization that does not exist."""
    with pytest.raises(ResourceNotFoundException):
        organization_svc_integration.delete(root, to_add.slug)
