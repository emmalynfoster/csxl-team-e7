# Student Organization Member Management

> Written by Emmalyn Foster, Bennett Mangum, Hunter Hamrick, and Albert He <br>_Last Updated: 5/2/2024_

# Introduction

Currently, there is no system to manage relationships between members and leadership of student organizations on the CSXL website. This feature aims to allow for the management of these relationships, enabling students to register for non-membership clubs and for leadership to accept/deny member applications. It will also allow leadership to be listed per organization. This will enable students and leaders to manage their organizations in one place, centralizing functionality.

# Personas

For the purposes of this feature, we will have a total of four personas on which to accomodate functionality.

| Persona       | Role                   | Functionality                                                            |
| ------------- | ---------------------- | ------------------------------------------------------------------------ |
| Sally Student | Not a member or leader | Join/request any organization                                            |
| Mark Member   | A member of a club     | Have certain admin permissions given by leadership and see member events |
| Larry Leader  | Leader of a club       | Access to all club information and most admin permissions for that club   |
| Rhonda Root   | Root admin             | Remove/add leaders and has access to all clubs                           |

# User Stories

## Sally Student

1. As Sally Student, I want to see a list of organizations and be able to
join or request to join these organizations based on membership type. 
2. As Sally Student, I want to see a status of pending when joining application-based memberships
3. As Sally Student, I want to see a list of my organizations when I join them

### Technical Implementation

1. The organization page will include a `"My Organizations"` tab alongside the search
3. The student will be able to click a button to join the organization
    * This will navigate to the given application
        <br>_Leaders will have the functionality to link applications themselves_
    * This will display a `pending` status on the student's `Organizations Details Page` on the join widget until leadership accepts/denies the request
    * If it is not application based, the organization will automatically appear with `member` status in the student's `"My Organizations"` tab

### Visualization

<br>

<img src="https://github.com/comp423-24s/csxl-final-team-e7/assets/111466810/94d6576e-8369-4b12-8d01-ada1da6da586" width="800" height="520">   
<img src="https://github.com/comp423-24s/csxl-final-team-e7/assets/111466810/ffc6d86c-8a30-466e-b54b-acb1f7584d64" width="800" height="520">
<img src="https://github.com/comp423-24s/csxl-final-team-e7/assets/111466810/0ea6eebc-2994-40f3-9567-99932dbc8751" width="800" height="520">



## Larry Leader
1. As Larry Leader, I want to see my membership status of my organization display `President` and the academic term of my leadership  
2. As Larry Leader, I want to be able to give certain members special titles depending on their role in the organization to 
3. As a leader, I want to accept/deny requests to join if my organization is application-based
   - This also includes an admin toggle to remove members 
5. As a leader, I want to change the `open to all/closed/application-based` status of my organization
6. As a leader, I want to change the link for the application or the application itself for my organization if it is application-based
7. As a leader, I want to change the description of the `join widget` for application-specific or membership specific details

### Technical Implementation

1. Modify the `join button widget` to have an editable description component
2. Implement functionality for attaching the leader's link input to the join button
    _Only allows one request/join (join button click) if open or application-based_
3. Implement member and leadership permissions per `Organization Member` method
4. Edit `Organization Details` to display members and pending membership requests
   - This includes an `edit` button which navigates to an `Edit Members` page only accessible by admin permissions
5. `Edit Members` page which allows the leader to:
   - Approve/deny requests
   - Click to edit individual members
   - Set `Organization Status` and the application link if `application-based`
6. Navigate to `Member Profile` to edit:
   - Title
   - Remove member entirely

## Visualization

<br>

<img src="https://github.com/comp423-24s/csxl-final-team-e7/assets/111466810/d83f835e-d5a2-4b5c-aef0-2cdc4b723cb2" width="800" height="520">
<img src="https://github.com/comp423-24s/csxl-final-team-e7/assets/111466810/c36e7a46-93c6-4d41-a5f9-4a6731082017" width="800" height="520"> 
<img src="https://github.com/comp423-24s/csxl-final-team-e7/assets/111466810/7cfc1cb6-aa06-40d5-a366-6bce61995be6" width="800" height="520"> 


## Mark Member 
1. As Mark member, I want to see a leave button on each organization I am a member of in the event I no longer want to be a member.
2. As Mark Member, I want to see each organization I am a member of displayed in my `My Organizations` tab.
3. As Mark Member, each card in the tab should be an organization I am member of, and should display my role in the organization, i.e. "Member" or "Outreach Lead."
4. Each card in the tab should also display the year and semester I joined, such as "Since: Fall 2024."

## Technical Implementations
1. Make a dynamic display of a join or leave button for members to leave an organizations once they are a member.
2. Grab organizations for a particular member, create a new `My Orgs` widget to display per membership
3. For each instance of a particular member in all organizations as an input, grab their `title` field and display per `My Orgs` card
4. For each instance of a particular member in all organizations as an input, grab the `semester` and `year` field and display in an interpolated string like "Since: Fall 2024"

## Rhonda Root
1. As Rhonda Root, I want to be able to have full permissions for each Organization, acting as admin for each.
2. I want this to allow me to have full functionality, including removing members, leaders, chaning application status and links, and updated the join description.
3. As Rhonda Root, only I have permissions to promote and demote leaders for an Organization. 

## Technical Implementation
1. For permissions implemented per leader, give Rhonda Root per organization.
2. Create functionality to change members from member to leader 


## Technical Requirements and Planning

### Existing Codebase <br>
#### Dependencies
1. Users: When an organization is joined or requested to be joined, we will need to keep track of which user joined or is trying to be joined.
2. Roles: There will be different views and actions for each role. A student should be able to join or request to join any organization with the option. A member can view member-only events and information for the organizations the member is a part of. Leaders with the proper authentication will have the ability to modify memberships and respond to new requests.

#### Extensions
A new many-to-many relationship will need to be established between the organization data and user data as organizations can have multiple users as members and users can join multiple organizations.
We will also need to establish a field so that an organization can store a leader who will potentially be responsible for responding to a member’s request to join.

### Page Components and Widgets
1. My Organizations Component: This is a component for a user to view and manage the organizations that they are a part of. This will only be accessible if the user is logged in and authenticated.
2. Membership Request Component: A component for users with the proper authentication as a leader to view and respond to membership requests.
   
### Models
1. Leader: Information stored in the organization that points to a user who is the leader of an organization.
Organizations: The list of organizations a user is apart of and the information regarding their role in a particular organization
2. Members: A list of the members in a particular organization and their role.
   
### API/Routes
1. Get Members: This returns the members that are currently a member of an organization. This can be used for personas who are looking to view the members of an organization.
2. Get Requested Members: This returns the members that have requested to join an organization. This will be used so that anyone with the proper authentication can view the current requests to join an organization.
3. Edit Role: This modifies the role of a member in an organization that can be used by anybody with the proper authentication and permissions, such as the leader.
4. Delete Member: This removes a member from an organization and can be used by those with the proper authentication when they wish to remove a member from an organization.
   
### Security and Privacy Concerns
1. All users that are logged will be able to view the entire list of organizations as well as access any applications that are linked to an organization.
2. All users that are logged in will be able to join organizations that are open and free to join.
3. All users that are logged in will be able to request to join organizations that require approval to join.
4. Members of an organization are the only ones who can view the member-only events of that organization.
5. Only the leader of a club is able to accept or reject a request to join an organization.
6. Only the leader of a club is able to remove a member of the organization.
7. Only the leader can change the role of a member in the organization.
8. Rhonda Root can designate or change the leader of an organization.





