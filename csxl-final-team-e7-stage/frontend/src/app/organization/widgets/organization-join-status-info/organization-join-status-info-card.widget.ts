import { Component, Input, OnInit } from '@angular/core';
import { Organization, OrganizationStatus } from '../../organization.model';
import { Profile } from '/workspace/frontend/src/app/profile/profile.service';
import { OrganizationService } from '../../organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Route } from '@angular/router';
import { profileResolver } from 'src/app/profile/profile.resolver';
import { organizationDetailResolver } from '../../organization.resolver';

@Component({
  selector: 'organization-join-status-info-card',
  templateUrl: './organization-join-status-info-card.widget.html',
  styleUrls: ['./organization-join-status-info-card.widget.css']
})
export class OrganizationJoinStatusInfoCard implements OnInit {
  /** The organization to show */
  @Input() organization!: Organization;
  /** The profile of the currently signed in user */
  @Input() profile?: Profile;
  /** @deprecated Stores the permission values for a profile */
  @Input() profilePermissions!: Map<number, number>;
  /**The organization member model associated with Organization */

  status = new FormControl('', [Validators.required]);
  link = new FormControl('', [this.validateLink]);
  statusOptions = Object.values(OrganizationStatus);

  public organizationStatusForm = this.formBuilder.group({
    status: this.status,
    link: this.link
  });

  constructor(
    protected snackBar: MatSnackBar,
    protected organizationService: OrganizationService,
    protected formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.organizationStatusForm.setValue({
      status: this.organization.status,
      link: this.organization.application_link
    });
  }

  onSubmit() {
    if (this.organizationStatusForm.valid) {
      let confirmStatus = this.snackBar.open(
        'Are you sure you want to update ' + this.organization.name + '?',
        'Update',
        { duration: 15000 }
      );
      confirmStatus.onAction().subscribe(() => {
        this.organization.status = this.organizationStatusForm.value.status!;
        this.organization.application_link =
          this.organizationStatusForm.value.link!;

        this.organizationService
          .updateOrganization(this.organization)
          .subscribe({
            next: () =>
              this.snackBar.open(
                'Updated ' + this.organization.name + '.',
                '',
                {
                  duration: 2000
                }
              ),
            error: (err) =>
              this.snackBar.open(
                'Error: Could not update ' + this.organization.name + '.',
                '',
                { duration: 2000 }
              )
          });
      });
    }
  }

  private validateLink(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value || control.value.trim() === '') {
      return null;
    }
    const linkPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return linkPattern.test(control.value) ? null : { invalidLink: true };
  }
}
