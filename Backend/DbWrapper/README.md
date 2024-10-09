# Firestore Database Wrapper

Wrapper with basic functions to use Firestore.

To use this, instantiate the class in your code and use the functions as described.

## Model Of the Database

The Firebase DB is document-based NoSQL Database, which means that it is non-relational. However, to better visualize how data is currently stored, an ERD will be used. Each function will describe what data is explicitly needed.

## Instantiating

`DbWrapper(db)`
db - Database Client object given by the Firestore client method.

## Functions

`getUserData(uid)` - Given an uid, returns a dict of that user's data

`getCourseData(course_id)` - Given a specific course, returns a dict of that courses entry

`getStudentCourses(student_id)` - Given a student ID, returns a list of dict containing all courses the student is in.

`addCourse()` - Status 0 is active, 1 is archived

`addStudentToCourse()`

`addUser()` - 0 is student, 1 is a prof

Note for course_ids, they should be provided by the user (ideally). This can really be anything so long as it is unique.