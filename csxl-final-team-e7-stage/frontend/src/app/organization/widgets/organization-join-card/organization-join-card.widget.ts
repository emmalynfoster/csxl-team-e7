import { Component, Input, OnInit } from '@angular/core';
import {
  MemberRole,
  Organization,
  OrganizationMember,
  OrganizationStatus
} from '../../organization.model';
import { Profile } from '/workspace/frontend/src/app/profile/profile.service';
import { OrganizationService } from '../../organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, of } from 'rxjs';

@Component({
  selector: 'organization-join-card',
  templateUrl: './organization-join-card.widget.html',
  styleUrls: ['./organization-join-card.widget.css']
})
export class OrganizationJoinCard implements OnInit {
  @Input() organization!: Organization;
  /** The profile of the currently signed in user */
  @Input() profile?: Profile;
  @Input() organizationMember!: Observable<OrganizationMember | null>;

  public isLeader$: Observable<boolean> = of(false);
  public text = of('');
  public disable = of(true);
  public isMember = of(false);
  constructor(
    protected snackBar: MatSnackBar,
    public organizationService: OrganizationService
  ) {}

  /** Runs whenever the view is rendered initally on the screen */
  ngOnInit(): void {
    if (this.profile) {
      this.isLeader$ = this.organizationService.isLeader(
        this.organization?.slug
      );
    }

    this.refreshItems(this.organizationMember);
  }

  refreshItems(organizationMember: Observable<OrganizationMember | null>) {
    this.text = organizationMember.pipe(
      map((v) =>
        v == null ? 'JOIN' : v.role == MemberRole.PENDING ? 'PENDING' : 'LEAVE'
      )
    );
    this.disable = organizationMember.pipe(
      map(
        (v) =>
          !this.profile ||
          this.organization.status == OrganizationStatus.CLOSED.valueOf() ||
          (v != null && v.role == MemberRole.PENDING)
      )
    );
    this.isMember = organizationMember.pipe(
      map((v) => v != null && v.role != MemberRole.PENDING)
    );
  }

  leavejoin() {
    this.isMember.subscribe({ next: (v) => (v ? this.leave() : this.join()) });
  }

  join() {
    this.organizationService.addMemberToOrg(this.organization.slug).subscribe({
      next: (organization_member) => this.onSuccess(organization_member),
      error: (err) => this.onError(err)
    });
  }

  leave() {
    let confirmLeave = this.snackBar.open(
      'Are you sure you want to leave ' + this.organization.name + '?',
      'Leave',
      { duration: 15000 }
    );
    confirmLeave.onAction().subscribe(() => {
      this.organizationService
        .removeMemberFromOrg(this.organization.slug)
        .subscribe(() => {
          this.organization.member_count -= 1;
          this.organization.is_member = false;
          this.snackBar.open('You left this organization', '', {
            duration: 2000
          });

          this.refreshItems(of(null));
        });
    });
  }

  private onSuccess(organization_member: OrganizationMember) {
    this.organization.member_count += 1;
    this.organization.is_member = true;
    this.snackBar.open('Thanks for joining!', '', { duration: 2000 });
    if (this.organization.application_link.length !== 0) {
      window.open(this.organization.application_link, '_blank');
    }
    this.refreshItems(
      this.organizationService.getOrganizationMember(this.organization.slug)
    );
  }

  private onError(err: any) {
    this.snackBar.open('Error: Organization not joined', '', {
      duration: 2000
    });
  }
}
