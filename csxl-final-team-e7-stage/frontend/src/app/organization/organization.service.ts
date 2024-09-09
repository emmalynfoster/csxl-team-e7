/**
 * The Organization Service abstracts HTTP requests to the backend
 * from the components.
 *
 * @author Ajay Gandecha, Jade Keegan, Brianna Ta, Audrey Toney
 * @copyright 2023
 * @license MIT
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, combineLatestWith, map } from 'rxjs';
import {
  MemberRole,
  Organization,
  OrganizationMember
} from './organization.model';
import { PublicProfile } from '../profile/profile.service';
import { PermissionService } from '../permission.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private organizations: ReplaySubject<Organization[]> = new ReplaySubject(1);
  organizations$: Observable<Organization[]> =
    this.organizations.asObservable();

  constructor(
    protected http: HttpClient,
    private permission: PermissionService
  ) {}

  /** Returns all organization entries from the backend database table using the backend HTTP get request.
   * @returns {Observable<Organization[]>}
   */
  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>('/api/organizations');
  }

  /** Returns the organization object from the backend database table using the backend HTTP get request.
   * @param slug: String representing the organization slug
   * @returns {Observable<Organization>}
   */
  getOrganization(slug: string): Observable<Organization> {
    return this.http.get<Organization>('/api/organizations/' + slug);
  }

  /** Returns the new organization object from the backend database table using the backend HTTP post request.
   * @param organization: OrganizationSummary representing the new organization
   * @returns {Observable<Organization>}
   */
  createOrganization(organization: Organization): Observable<Organization> {
    return this.http.post<Organization>('/api/organizations', organization);
  }

  /** Returns the updated organization object from the backend database table using the backend HTTP put request.
   * @param organization: OrganizationSummary representing the updated organization
   * @returns {Observable<Organization>}
   */
  updateOrganization(organization: Organization): Observable<Organization> {
    return this.http.put<Organization>('/api/organizations', organization);
  }

  /** User joins the given organization using the backend HTTP put request
   *  @param slug: String representing the organization slug
   *  @param user_id: Optional number represeting the id of a user
   *  @returns {Observable<OrganizationMember>}
   */
  addMemberToOrg(
    slug: string,
    user_id?: number
  ): Observable<OrganizationMember> {
    let path = `/api/organizations/${slug}/members`;

    if (user_id) {
      path += `?user_id=${user_id}`;
    }

    return this.http.post<OrganizationMember>(path, null);
  }

  /**
   * Updates member using the backend HTTP put request
   * @param member: a valid OrganizationMember model
   * @returns {Observable<OrganizationMember>}
   */
  updateMember(member: OrganizationMember) {
    return this.http.put<OrganizationMember>(
      '/api/organizations/members',
      member
    );
  }

  /**
   * User removed from given organization using the backend HTTP delete request
   * @param slug: String representing the organization slug
   * @param user_id: Optional number represeting the id of a user
   * @returns {null}
   */
  removeMemberFromOrg(slug: string, user_id?: number) {
    let path = `/api/organizations/${slug}/members`;

    if (user_id) {
      path += `?user_id=${user_id}`;
    }

    return this.http.delete<null>(path);
  }

  /**
   * Gets member using the backend HTTP get request
   * @param slug: String representing the organization slug
   * @param user_id: Optional number representing the id of user
   * @returns {Observable<OrganizationMember | null>}
   */
  getOrganizationMember(slug: string, user_id?: number) {
    let path = `/api/organizations/${slug}/member`;

    if (user_id) {
      path += `?user_id=${user_id}`;
    }

    return this.http.get<OrganizationMember | null>(path);
  }

  /**
   * Returns all public profiles that are members are the given organization using the backend HTTP get request
   * @param slug: String representing the organization slug
   * @param pending: Optional boolean, when true shows pending members
   * @returns {Observable<PublicProfile[]>}
   */

  getOrganizationMembers(
    slug: string,
    pending?: boolean
  ): Observable<PublicProfile[]> {
    let path = `/api/organizations/${slug}/members`;

    if (pending != undefined) {
      path += `?pending=${pending}`;
    }

    return this.http.get<PublicProfile[]>(path);
  }

  /**
   * Returns all organizations that the user is a member of using the backend HTTP get request
   * @param user_id: Optional number represeting the id of a user
   * @param pending: Optional boolean, when true shows pending members
   * @returns {Observable<OrganizationMember[]>}
   */
  getUserMemberships(
    user_id?: number,
    pending?: boolean
  ): Observable<Organization[]> {
    let path = '/api/organizations/memberships/';

    if (user_id) {
      path += `?user_id=${user_id}`;
    }
    if (pending != undefined) {
      path += user_id ? `&pending=${user_id}` : `?pending=${pending}`;
    }

    return this.http.get<Organization[]>(path);
  }

  /**
   * Returns observable that represents if authd user has leader perms for given org
   * @param slug String representing the organization slug
   * @returns {Observable<boolean>}
   */
  isLeader(slug: string): Observable<boolean> {
    let hasPerms$ = this.permission.check(
      'organization.update',
      `organization/${slug}`
    );

    let isLeader$ = this.getOrganizationMember(slug).pipe(
      map((v) => v != null && v.role == MemberRole.LEADER)
    );

    // hasPerms$ || isLeader$
    return hasPerms$.pipe(
      combineLatestWith(isLeader$),
      map((v) => v[0] || v[1])
    );
  }
}
