# Firestore Database Wrapper

Wrapper with basic functions to use Firestore.

To use this, instantiate the class in your code and use the functions as described.

## Model Of the Database

The Firebase DB is document-based NoSQL Database, which means that it is non-relational. However, to better visualize how data is currently stored, an ERD will be used. Each function will describe what data is explicitly needed.

![](./StartERD.png)

## Instantiating

`DbWrapper(db)`
db - Database Client object given by the Firestore client method.

## Functions

`archiveCourse(course_id)` - Given a course ID, mark it as archived (status = 1 in DB). Returns True if successful.

`activateCourse(course_id)` - Given a course ID, mark it as archived (status = 0 in DB). Returns True if successful.

`getUserData(uid)` - Given an uid, returns a dict of that user's data.

Note:

- A user's uid is obtained from the Authentication side of things.

`getCourseData(course_id)` - Given a specific course, returns a dict of that courses entry.

`getStudentCourses(student_id)` - Given a student ID, returns a list of dict containing all courses the student is in.

Note:

- student_id is a user uid

`getInstructorCourses(instructor_id)` - Given an instructor ID, returns a list of dict containing all courses the instructor teaches.

Note:

- instructor_id is a user uid

`getProjectData(project_id)` - Given a project ID, returns a dict containing project data.

`getGroupData(group_id)` - Given a group ID, returns a dict containing group data.

`getStudentGroups(student_id)` - Given a student ID, returns a list of dict containing all groups a student is in.

`getTeamJoy(group_id)` - Given a group ID, returns a list of dict containing all joy data for a given team.

`getProjectGroups(project_id)` - Given a project ID, return a list of dict containing all groups.

`getCourseProjects(course_id)` - Given a course ID, return a list of dict containing all projects.

`getTeamVelocity(group_id)` - Given a group ID, return a list of dict containing all velocity data.

`addStudentToCourse(student_id, course_id)` - Given a student ID and course ID, add a student to a course. Returns True if successful.

Note:

- student_id is a user uid

`addInstructorToCourse(instructor_id, course_id)` - Given an instructor ID and a course ID, add an instructor to a course. Returns True is successful.

Note:

- instructor_id is a user uid

`addCourse(course_description, course_id, instructor_ids, section, term, student_ids: optional, status: optional)` - Given data points, create a course entry in the database. Returns True if successful.

Note:
- status - 0 is active, 1 is archived (0 is default)
- course_ids - They should be provided by the user (ideally). This can really be anything so long as it is unique.
- instructor_ids and student_ids - These are data arrays, meaning these MUST be a list. These specific IDS are UIDs.
- section - Should be something like "FR01A"
- term - Should be something like "FA2024"

`addUser(accType, email, first_name, last_name, uid, github_personal_access_token: optional)` - Given data points, create a user entry in the database. Returns True if successful.

Note:
- accType - 0 is student, 1 is a prof
- uid - Derived from Authentication
- github_personal_access_token - Optional for now. May become mandatory in future sprints. (Default is empty string)

`addGithubTokenToUser(uid, github_personal_access_token)` - Given an uid and a GitHib token, add the token to the corresponding user entry. Returns True if successful.

`addProject(course_id, project_id, project_name, github_repo_address: optional)` - Given data points, create a project entry in the database. Returns True if successful.

Note:
- project_id - This *should* be user defined, however it can be anything so long as it is unique.
- github_repo_address - Optional for now. May become mandatory in future sprints. (Default is empty string)

`addGroup(project_id, student_ids: optional, github_repo_address: optional, scrum_master: optional)` - Given data points, create a group entry in the database. Returns True if successful. Auto-ID's projects

Note:
- group_id - This can either be created as a combination of the project ID and some incrementing integer or user defined, so long as the ID is unique.
- student_ids - Should be an array of user IDs. These may not be predefined, however if they are, you may add them here. (Default is empty list)
- github_repo_address - Should be a link to a GitHub repo. This may be added later by the scrum master. (Default is empty string)
- scrum_master - List of UIDs of a person defined to be a scrum master. (Default is empty list)

`addGithubRepoToGroup(group_id, github_repo_address)` - Given a group_id and a scrum_master, add the scrum master to the group. Returns True if successful.

Note:
- Only the scrum master should have access to this method.

`addNGroups(project_id, n)` - Given a project ID and some integer, batch add N number of groups to a project. Returns True if successful.

`addStudentToGroup(group_id, student_id)` - Given a group ID and a student ID, add a student to a group. Returns True if successful.

`addScrumMasterToGroup(group_id, scrum_master)` - Given a scrum master and a group ID, add the scrum master to the group. Returns True if successful.

Note:
- scrum_master - Should be a list of user UIDs.

`addJoyRating/updateJoyRating(student_id, group_id, joy_rating)` - For now, addJoyRating incorporates the functionality of updateJoyRating if the entry already exists. It is recommended to use addJoyRating for all joy rating operations. Returns True if successful.

Note:
- joy_rating - Should be an int between 1-5

`addVelocityData(group_id, sprint_start, sprint_end, planned_points, completed_points: optional)` - Given data points, creates an entry in the velocity table. Entries are given auto-IDs Returns True if successful.

Note:
- sprint_start and sprint_end must be Python datetime objects.
- The auto-IDs are assigned sequentially based on how many entries the group has. The document ID (as well as any reference to velocity_id) is derived from {group_id}_Sprint{sprint_num}. sprint_num is also stored in the newly created entry.

`updateVelocityData(velocity_id, sprint_start: optiona, sprint_end: optional, planned_points: optional, completed_points: optional)` - Change what you need in a given velocity entry. All fields are optional. Returns True if successful.

Note:
- sprint_start and sprint_end must be Python datetime objects.
- velocity_id is derived from {group_id}_Sprint{sprint_num}

`removeCourse(course_id)` - Given a course ID, deletes the course entry from the database. Returns True if successful.

`removeProject(project_id)` - Given a project ID, deletes the project entry and any associated group entries from the database. Returns True if successful.

`removeGroup(group_id)` - Given a group ID, deletes the group entry from the database. Returns True if successful.

`removeVelocity(velocity_id)` - Given a velocity ID, deletes the velocity entry from the database. Returns True if successful.

Note:
- Velocity ID is derived from {group_id}_Sprint{sprint_num}

`findUser(email)` - Given an email, returns a user entry in the database. Returns None if entry is not found.