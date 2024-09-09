import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateFn,
  Route,
  Router
} from '@angular/router';
import { OrganizationService } from '../organization.service';
import { PublicProfile } from 'src/app/profile/profile.service';
import { MemberRole, OrganizationMember } from '../organization.model';
import { MatSnackBar } from '@angular/material/snack-bar';

const canActivateEditor: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  /** Determine if page is viewable by user based on permission */

  let slug: string = route.params['slug'];

  return inject(OrganizationService).isLeader(slug);
};

@Component({
  selector: 'app-organization-members-page',
  templateUrl: './organization-members-page.component.html',
  styleUrls: ['./organization-members-page.component.css']
})
export class OrganizationMembersPageComponent {
  public static Route: Route = {
    path: ':slug/members',
    component: OrganizationMembersPageComponent,
    title: 'Organization Members',
    canActivate: [canActivateEditor]
  };

  public members: PublicProfile[] = [];
  public pending_members: PublicProfile[] = [];
  public searchBarQuery = '';
  slug: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    protected snackBar: MatSnackBar
  ) {
    this.slug = this.route.snapshot.params['slug'];

    this.organizationService.getOrganizationMembers(this.slug).subscribe({
      next: (members) => (this.members = members)
    });
    this.organizationService.getOrganizationMembers(this.slug, true).subscribe({
      next: (pending_members) => (this.pending_members = pending_members)
    });
  }

  editdelete(memberaction: [PublicProfile, number]) {
    if (memberaction[1] == 0) {
      this.edit(memberaction[0]);
    } else {
      this.delete(memberaction[0]);
    }
  }

  edit(member: PublicProfile) {
    this.router.navigate(['organizations', this.slug, 'members', member.id]);
  }

  delete(member: PublicProfile) {
    let confirmDelete = this.snackBar.open(
      'Are you sure you want to delete ' +
        member.first_name +
        ' ' +
        member.last_name +
        '?',
      'DELETE',
      { duration: 15000 }
    );
    confirmDelete.onAction().subscribe(() => {
      this.organizationService
        .removeMemberFromOrg(this.slug, member.id)
        .subscribe();
      this.remove_member(member);
    });
  }

  acceptdeny(memberaction: [PublicProfile, number]) {
    if (memberaction[1] == 0) {
      this.accept(memberaction[0]);
    } else {
      this.deny(memberaction[0]);
    }
  }

  private accept(member: PublicProfile) {
    this.organizationService
      .getOrganizationMember(this.slug, member.id)
      .subscribe({
        next: (organization_member) => {
          if (organization_member) {
            this.change_role(organization_member);
          }
        }
      });
    this.remove_pending(member);
    this.members.push(member);
  }

  private deny(member: PublicProfile) {
    this.organizationService
      .removeMemberFromOrg(this.slug, member.id)
      .subscribe();
    this.remove_pending(member);
  }

  private change_role(organization_member: OrganizationMember) {
    organization_member.role = MemberRole.MEMBER;
    this.organizationService.updateMember(organization_member).subscribe();
  }

  private remove_pending(member: PublicProfile) {
    let i = this.pending_members.indexOf(member);
    if (i != -1) {
      this.pending_members.splice(i, 1);
    }
  }

  private remove_member(member: PublicProfile) {
    let i = this.members.indexOf(member);
    if (i != -1) {
      this.members.splice(i, 1);
    }
  }
}
