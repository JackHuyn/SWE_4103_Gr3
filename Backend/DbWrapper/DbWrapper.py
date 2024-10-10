import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import ArrayUnion
import os

COURSES = "coursedata"
GROUPS = "groupdata"
PROJECTS = "projectdata"
USERS = "userdata"

class DbWrapper:
    def __init__(self, dbObject):
        self.db = dbObject
    def archiveCourse(self, course_id:str)->bool:
        doc = self.db.collection(COURSES).document(course_id)
        try:
            doc.update({"status": 1})
        except:
            return False
        return True
    def activateCourse(self, course_id:str)->bool:
        doc = self.db.collection(COURSES).document(course_id)
        try:
            doc.update({"status": 0})
        except:
            return False
        return True
    def getUserData(self, uid:str) -> dict:
        docs = self.db.collection(USERS).document(uid).get()
        return docs.to_dict()
    def getCourseData(self, course_id:str) -> dict:
        docs = self.db.collection(COURSES).document(course_id).get()
        return docs.to_dict()
    def getStudentCourses(self, student_id:str) -> list[dict]:
        docs = self.db.collection(COURSES).where(filter=FieldFilter("student_ids", "array_contains", student_id)).stream()
        docList = []
        for doc in docs:
            docList.append(doc.to_dict())
        return docList
    def getInstructorCourses(self, instructor_id:str) -> list[dict]:
        docs = self.db.collection(COURSES).where(filter=FieldFilter("instructor_ids", "array_contains", instructor_id)).stream()
        docList = []
        for doc in docs:
            docList.append(doc.to_dict())
        return docList
    def addUser(self, accType:int, email:str, first_name:str, last_name:str, uid:str, github_personal_access_token:str="")->bool:
        x = [i for i in self.db.collection(USERS).where(filter=FieldFilter("uid", "==", uid)).stream()]
        if len(x) > 0:
            return False
        template = {}
        template["account_type"] = accType
        template["email"] = email
        template["first_name"] = first_name
        template["last_name"] = last_name
        template["uid"] = uid
        template["github_personal_access_token"] = github_personal_access_token
        self.db.collection(USERS).document(uid).set(template)
        return True
    def addStudentToCourse(self, student_id:str, course_id:str) -> bool:
        doc = self.db.collection(COURSES).document(course_id)
        try:
            doc.update({"student_ids": ArrayUnion([student_id])})
        except:
            return False
        return True
    def addInstructorToCourse(self, instructor_id:str, course_id:str) -> bool:
        doc = self.db.collection(COURSES).document(course_id)
        try:
            doc.update({"instructor_ids": ArrayUnion([instructor_id])})
        except:
            return False
        return True
    def addCourse(self, course_description:str, course_id:str, instructor_ids:list[str], section:str, term:str, project_ids=[], student_ids=[], status=0)->bool:
        x = [i for i in self.db.collection(COURSES).where(filter=FieldFilter("course_id", "==", course_id)).stream()]
        if len(x) > 0:
            return False
        template = {}
        template["course_description"] = course_description
        template["course_id"] = course_id
        template["instructor_ids"] = instructor_ids
        template["section"] = section
        template["term"] = term
        template["project_ids"] = project_ids
        template["student_ids"] = student_ids
        self.db.collection(COURSES).document(course_id).set(template)
        return True
    def removeCourse(self, course_id:str)->bool:
        x = [i for i in self.db.collection(COURSES).where(filter=FieldFilter("course_id", "==", course_id)).stream()]
        if len(x) == 0:
            return False
        try:
            db.collection(COURSES).document(course_id).delete()
        except:
            return False
        return True

if __name__ == "__main__":
    FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'
    credFileName = "swe4103-7b261-firebase-adminsdk.json"

    dir_path = os.path.dirname(os.path.realpath(__file__))
    cred = credentials.Certificate(dir_path + "/../" + credFileName)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    test = DbWrapper(db)
    docs = test.getStudentCourses("3713652")
    print(docs)
    print(test.addStudentToCourse("3713652", "TestCourse"))
    print(test.getUserData("TestUser"))
    print(test.addUser(1,"test111@unb.ca","Test","Account","some_student"))
    print(test.addCourse("Another Test Course", "TestCourseAgain", ["some_prof"], "FR01A", "FA2024"))
    print(test.activateCourse("TestCourseAgain"))
    print(test.getInstructorCourses("some_prof"))
    #print(test.removeCourse("TestCourseAgain"))