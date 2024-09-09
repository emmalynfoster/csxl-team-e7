/**
 * The Organization Model defines the shape of Organization data
 * retrieved from the Organization Service and the API.
 *
 * @author Ajay Gandecha, Jade Keegan, Brianna Ta, Audrey Toney
 * @copyright 2023
 * @license MIT
 */

import { Event } from '../event/event.model';
import { Profile } from '../models.module';

/** Interface for Organization Type (used on frontend for organization detail) */
export interface Organization {
  id: number | null;
  name: string;
  logo: string;
  short_description: string;
  long_description: string;
  join_description: string;
  website: string;
  email: string;
  instagram: string;
  linked_in: string;
  youtube: string;
  heel_life: string;
  public: boolean;
  slug: string;
  shorthand: string;
  is_member: boolean;
  member_count: number;
  status: string;
  application_link: string;
  events: Event[] | null;
}

export interface OrganizationMember {
  id: number | null;
  organization_id: number;
  user_id: number;
  year: number;
  semester: Semester;
  organization: Organization | null;
  user: Profile | null;
  role: MemberRole;
  title: string;
}

export enum MemberRole {
  MEMBER = 'MEMBER',
  LEADER = 'LEADER',
  PENDING = 'PENDING'
}

export enum OrganizationStatus {
  OPEN = 'OPEN',
  APPLICATION_BASED = 'APPLICATION BASED',
  CLOSED = 'CLOSED'
}

export enum Semester {
  SPRING = 'SPRING',
  FALL = 'FALL',
  SUMMER = 'SUMMER'
}
