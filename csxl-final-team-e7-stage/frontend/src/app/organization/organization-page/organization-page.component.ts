/**
 * The Organization Page Component serves as a hub for students to browse all of the CS
 * organizations at UNC. Students are also able to join public organizations, filter
 * based on interests, and access social media pages of organizations to stay up-to-date.
 *
 * @author Ajay Gandecha, Jade Keegan, Brianna Ta, Audrey Toney
 * @copyright 2023
 * @license MIT
 */

import { Component } from '@angular/core';
import { profileResolver } from '/workspace/frontend/src/app/profile/profile.resolver';
import {
  MemberRole,
  Organization,
  OrganizationMember
} from '../organization.model';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profile } from '/workspace/frontend/src/app/profile/profile.service';
import {
  organizationResolver
} from '../organization.resolver';
import { OrganizationService } from '../organization.service';
import { Observable, of } from 'rxjs';
import { OrganizationMemberCard } from '../widgets/organization-member-card/organization-member-card.widget';

@Component({
  selector: 'app-organization-page',
  templateUrl: './organization-page.component.html',
  styleUrls: ['./organization-page.component.css']
})
export class OrganizationPageComponent {
  /** Route information to be used in Organization Routing Module */
  public static Route = {
    path: '',
    title: 'CS Organizations',
    component: OrganizationPageComponent,
    canActivate: [],
    resolve: {
      profile: profileResolver,
      organizations: organizationResolver,
    }
  };

  /** Store Observable list of Organizations */
  public organizations: Organization[];

  /** Store searchBarQuery */
  public searchBarQuery = '';

  /** Store the currently-logged-in user's profile.  */
  public profile: Profile;

  public myOrganizations!: Observable<Organization[]>;
  public myOrgRoles: MemberRole[] = [];
  /** Stores the user permission value for current organization. */
  public permValues: Map<number, number> = new Map();

  constructor(
    private route: ActivatedRoute,
    protected snackBar: MatSnackBar,
    public organizationService: OrganizationService
  ) {
    /** Initialize data from resolvers. */
    const data = this.route.snapshot.data as {
      profile: Profile;
      organizations: Organization[];
      myOrganizations: OrganizationMember[];
    };
    this.profile = data.profile;
    this.organizations = data.organizations;
    this.myOrganizations = this.organizationService.getUserMemberships()

    }  
}
