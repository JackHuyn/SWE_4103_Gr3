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


`addStudentToCourse(student_id, course_id)` - Given a student ID and course ID, add a student to a course. Returns True if successful.

Note:

- student_id is a user uid

`addInstructorToCourse(instructor_id, course_id)` - Given an instructor ID and a course ID, add an instructor to a course. Returns True is successful.

Note:

- instructor_id is a user uid

`addCourse(course_description, course_id, instructor_ids, section, term, project_ids: optional, student_ids: optional, status: options)` - Given data points, create a course entry in the database. Returns True if successful.

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

`removeCourse(course_id)` - Given a course ID, deletes the course entry from the database. Returns True if successful.