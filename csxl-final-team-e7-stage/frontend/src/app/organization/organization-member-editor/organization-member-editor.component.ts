import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateFn,
  Route
} from '@angular/router';
import { OrganizationService } from '../organization.service';
import { MemberRole, OrganizationMember } from '../organization.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

const canActivateEditor: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  /** Determine if page is viewable by user based on permission */

  let slug: string = route.params['slug'];

  return inject(OrganizationService).isLeader(slug);
};

@Component({
  selector: 'app-organization-member-editor',
  templateUrl: './organization-member-editor.component.html',
  styleUrls: ['./organization-member-editor.component.css']
})
export class OrganizationMemberEditorComponent {
  public static Route: Route = {
    path: ':slug/members/:user_id',
    component: OrganizationMemberEditorComponent,
    title: 'Edit Member',
    canActivate: [canActivateEditor]
  };

  public member: OrganizationMember | null = null;

  role = new FormControl('', [Validators.required]);
  title = new FormControl('');
  roleOptions = Object.values(MemberRole);

  public memberEditForm = this.formBuilder.group({
    role: this.role,
    title: this.title
  });

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    protected formBuilder: FormBuilder,
    protected snackBar: MatSnackBar
  ) {
    let slug: string = this.route.snapshot.params['slug'];
    let user_id: number = this.route.snapshot.params['user_id'];
    this.organizationService.getOrganizationMember(slug, user_id).subscribe({
      next: (member) => {
        this.member = member;
        this.memberEditForm.setValue({
          role: member!.role,
          title: member!.title
        });
      }
    });
    // remove pending from role optionsmn
    this.roleOptions.splice(this.roleOptions.indexOf(MemberRole.PENDING, 1));
  }

  onSubmit() {
    if (this.memberEditForm.valid) {
      let confirmStatus = this.snackBar.open(
        'Are you sure you want to update this member?',
        'Update',
        { duration: 15000 }
      );
      confirmStatus.onAction().subscribe(() => {
        if (this.member) {
          this.member.role = this.memberEditForm.value.role! as MemberRole;
          this.member.title = this.memberEditForm.value.title!;

          this.organizationService.updateMember(this.member).subscribe({
            next: () =>
              this.snackBar.open('Updated', '', {
                duration: 2000
              }),
            error: (err) =>
              this.snackBar.open('Error: Could not update', '', {
                duration: 2000
              })
          });
        }
      });
    }
  }
}
