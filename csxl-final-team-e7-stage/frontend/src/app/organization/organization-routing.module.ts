/**
 * The Organization Routing Module holds all of the routes that are children
 * to the path /organizations/...
 *
 * @author Ajay Gandecha, Jade Keegan, Brianna Ta, Audrey Toney
 * @copyright 2023
 * @license MIT
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationPageComponent } from './organization-page/organization-page.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OrganizationEditorComponent } from './organization-editor/organization-editor.component';
import { OrganizationMembersPageComponent } from './organization-members-page/organization-members-page.component';
import { OrganizationMemberEditorComponent } from './organization-member-editor/organization-member-editor.component';
import { OrganizationJoinDescriptionEditorComponent } from './organization-join-description-editor/organization-join-description-editor.component';

const routes: Routes = [
  OrganizationPageComponent.Route,
  OrganizationDetailsComponent.Route,
  OrganizationEditorComponent.Route,
  OrganizationMembersPageComponent.Route,
  OrganizationMemberEditorComponent.Route,
  OrganizationJoinDescriptionEditorComponent.Route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {}
