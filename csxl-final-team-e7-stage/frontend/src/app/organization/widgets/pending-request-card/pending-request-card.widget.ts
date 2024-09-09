import { Component, Input, OnInit } from '@angular/core';
import { Organization } from '../../organization.model';
import { OrganizationService } from '../../organization.service';
import { PublicProfile } from 'src/app/profile/profile.service';

@Component({
  selector: 'pending-request-card',
  templateUrl: './pending-request-card.widget.html',
  styleUrls: ['./pending-request-card.widget.css']
})
export class PendingRequestCard implements OnInit {
  @Input() organization!: Organization;

  pendingMembers: PublicProfile[] = [];

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.organizationService
      .getOrganizationMembers(this.organization.slug, true)
      .subscribe({
        next: (pendingMembers) => (this.pendingMembers = pendingMembers)
      });
  }
}
