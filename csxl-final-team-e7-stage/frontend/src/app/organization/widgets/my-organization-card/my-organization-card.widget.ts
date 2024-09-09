import { Component, Input, OnInit } from '@angular/core';
import { Organization, OrganizationMember } from '../../organization.model';
import { Profile } from '/workspace/frontend/src/app/profile/profile.service';
import { OrganizationService } from '../../organization.service';

@Component({
  selector: 'my-organization-card',
  templateUrl: './my-organization-card.widget.html',
  styleUrls: ['./my-organization-card.widget.css']
})

export class MyOrganizationCard implements OnInit {
  /** The organization to show */
  @Input() organization!: Organization;
  /** The profile of the currently signed in user */
  @Input() profile?: Profile;
  /** @deprecated Stores the permission values for a profile */
  @Input() profilePermissions!: Map<number, number>;
  /**The organization member model associated with Organization */
  organizationMember!: OrganizationMember;

  /**
   * Determines whether or not the tooltip on the card is disabled
   * @param element: The HTML element
   * @returns {boolean}
   */
  isTooltipDisabled(element: HTMLElement): boolean {
    return element.scrollHeight <= element.clientHeight;
  }


  constructor(protected organizationService: OrganizationService) {}
  ngOnInit(): void {
    this.organizationService
      .getOrganizationMember(this.organization.slug, this.profile!.id!)
      .subscribe({ next: (member) => (this.organizationMember = member!) });
  }

  getOrgMembers() {
    return this.organizationService.getOrganizationMembers(
      this.organization.slug
    );
  }
}
