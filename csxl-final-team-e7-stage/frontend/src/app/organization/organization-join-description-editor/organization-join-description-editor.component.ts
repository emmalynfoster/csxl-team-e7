import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateFn,
  Route,
  Router
} from '@angular/router';
import { Organization } from '../organization.model';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profile } from 'src/app/models.module';
import { OrganizationService } from '../organization.service';
import { profileResolver } from 'src/app/profile/profile.resolver';
import { organizationDetailResolver } from '../organization.resolver';

const canActivateEditor: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  /** Determine if page is viewable by user based on permission */

  let slug: string = route.params['slug'];

  return inject(OrganizationService).isLeader(slug);
};

@Component({
  selector: 'app-organization-join-description-editor',
  templateUrl: './organization-join-description-editor.component.html',
  styleUrls: ['./organization-join-description-editor.component.css']
})
export class OrganizationJoinDescriptionEditorComponent {
  /** Route information to be used in Organization Routing Module */
  public static Route: Route = {
    path: ':slug/edit-description',
    component: OrganizationJoinDescriptionEditorComponent,
    title: 'Organization Join Description Editor',
    resolve: {
      profile: profileResolver,
      organization: organizationDetailResolver
    },
    canActivate: [canActivateEditor]
  };

  /**Store the organization */
  public organization: Organization;

  /**Store the currently-logged-in user's profile */
  public profile: Profile | null = null;

  /**Store the organization id. */
  organization_slug: string;

  /**Add validator to the form. */
  description = new FormControl('', [
    Validators.required,
    Validators.maxLength(500)
  ]);

  /** Organization Join Button Editor Form */
  public organizationForm = this.formBuilder.group({
    description: this.description
  });

  /**Constructs the organization join description editor component */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected formBuilder: FormBuilder,
    protected snackBar: MatSnackBar,
    private organizationService: OrganizationService
  ) {
    const data = this.route.snapshot.data as {
      profile: Profile;
      organization: Organization;
    };
    this.profile = data.profile;
    this.organization = data.organization;

    this.organizationForm.setValue({
      description: this.organization.join_description
    });

    let organization_slug = this.route.snapshot.params['slug'];
    this.organization_slug = organization_slug;
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      this.organization.join_description =
        this.organizationForm.value.description!;

      this.organizationService.updateOrganization(this.organization).subscribe({
        next: (organization) => this.onSuccess(organization),
        error: (err) => this.onError(err)
      });
    }
  }

  private onSuccess(organization: Organization): void {
    this.router.navigate(['/organizations/', organization.slug]);

    this.snackBar.open('Join Description Edited!', '', { duration: 2000 });
  }

  private onError(err: any): void {
    this.snackBar.open('Error: Join Description Not Edited!', '', {
      duration: 2000
    });
  }
}
