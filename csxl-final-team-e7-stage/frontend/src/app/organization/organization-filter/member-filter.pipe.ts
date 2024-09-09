import { Pipe, PipeTransform } from '@angular/core';
import { PublicProfile } from 'src/app/profile/profile.service';

@Pipe({
  name: 'memberFilter'
})
export class MemberFilterPipe implements PipeTransform {
  /** Returns a mapped array of members that start with the input string (if search query provided).
   * @param {Observable<PublicProfile[]>} organizations: observable list of valid PublicProfile models
   * @param {String} searchQuery: input string to filter by
   * @returns {Observable<Organization[]>}
   */
  transform(members: PublicProfile[], searchQuery: String): PublicProfile[] {
    // Sort the members list alphabetically by name
    members = members.sort((a: PublicProfile, b: PublicProfile) => {
      return (
        a.first_name.toLowerCase() + a.last_name.toLowerCase()
      ).localeCompare(b.first_name.toLowerCase() + b.last_name.toLowerCase());
    });

    // If a search query is provided, return the members that start with the search query.
    if (searchQuery) {
      return members.filter(
        (member) =>
          member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Otherwise, return the original list.
      return members;
    }
  }
}
