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

`addProject(course_id, project_id, project_name, github_repo_address: optional)` - Given data points, create a project entry in the database. Returns True if successful.

Note:
- project_id - This *should* be user defined, however it can be anything so long as it is unique.
- github_repo_address - Optional for now. May become mandatory in future sprints. (Default is empty string)

`addGroup(project_id, student_ids: optional)` - Given data points, create a group entry in the database. Returns True if successful. Auto-IDs projects

Note:
- group_id - This can either be created as a combination of the project ID and some incrementing integer or user defined, so long as the ID is unique.
- student_ids - Should be an array of user IDs. These may not be predefined, however if they are, you may add them here. (Default is empty list)

`addNGroups(project_id, n)` - Given a project ID and some integer, batch add N number of groups to a project. Returns True if successful.

`addStudentToGroup(group_id, student_id)` - Given a group ID and a student ID, add a student to a group. Returns True if successful.

`addJoyRating/updateJoyRating(student_id, group_id, joy_rating, timestamp)` - For now, addJoyRating incorporates the functionality of updateJoyRating if the entry already exists. It is recommended to use addJoyRating for all joy rating operations. Returns True if successful.

Note:
- joy_rating - Should be an int between 1-5
- timestamp - Should be an int. See below for guidance on timestamps.

### Sidenote about Timestamps in Python

Timestamps can be a little wonky in Python. The easiest way to approach this is to use the built-in datetime library. Consider the following Python code:

```python
import datetime

datetime.datetime.strptime(datetime.datetime.now().strftime("%d/%m/%Y"), "%d/%m/%Y").timestamp() # This returns a float
```

The addJoyRating function expects a timestamp. However, we do not care about the time of day the rating occurred (mainly to avoid database clutter and avoid input abuse): we only need a day, month, and year. The above code will provide the timestamp we need (albeit, in a not very elegant statement). This value should also be cast to an int (although we get a float, the floating point portion is never used since this is reserved for microseconds). <b>NOT CASTING TO AN INT WILL CAUSE UNDEFINED BEHAVIOUR WHEN INTERACTING WITH THE DATABASE!</b>

`removeCourse(course_id)` - Given a course ID, deletes the course entry from the database. Returns True if successful.

`removeProject(project_id)` - Given a project ID, deletes the project entry and any associated group entries from the database. Returns True if successful.

`removeGroup(group_id)` - Given a group ID, deletes the group entry from the database. Returns True if successful.

`findUser(email)` - Given an email, returns a user entry in the database. Returns None if entry is not found.