import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicProfile } from '/workspace/frontend/src/app/profile/profile.service';

@Component({
  selector: 'organization-member-card',
  templateUrl: './organization-member-card.widget.html',
  styleUrls: ['./organization-member-card.widget.css']
})
export class OrganizationMemberCard {
  @Input() member!: PublicProfile;
  @Input() buttonsTxt!: string[];
  @Input() deleteButtonsTxt!: string[];
  @Output() buttonsPressed = new EventEmitter<[PublicProfile, number]>();

  constructor() {}
}
