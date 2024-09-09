import { Component, Input } from '@angular/core';
import { Organization } from '../../organization.model';
import { Profile } from 'src/app/models.module';
import { PermissionService } from 'src/app/permission.service';
import { Observer } from 'rxjs';
import { PublicProfile } from 'src/app/profile/profile.service';

@Component({
  selector: 'edit-member-card',
  templateUrl: './edit-member.widget.html',
  styleUrls: ['./edit-member.widget.css']
})
export class EditMemberCard {
  @Input() organizationMembers!: PublicProfile[];

  @Input() profile!: Profile;

  @Input() organization!: Organization;

  constructor(private permission: PermissionService) {}

  /*checkPermissions(): Observer<boolean> {
    return this.permission.check(
      'organization.update',
      `organization/${this.organization!.slug}`
    );
  }*/
}
