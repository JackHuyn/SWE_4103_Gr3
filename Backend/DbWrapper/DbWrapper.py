import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter, And
from google.cloud.firestore_v1 import ArrayUnion
import os
import datetime

COURSES = "coursedata"
GROUPS = "groupdata"
PROJECTS = "projectdata"
USERS = "userdata"
JOY = "joydata"

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
    def getProjectData(self, project_id:str)->dict:
        docs = self.db.collection(PROJECTS).document(project_id).get()
        return docs.to_dict()
    def getGroupData(self, group_id:str)->dict:
        docs = self.db.collection(GROUPS).document(group_id).get()
        return docs.to_dict()
    def getStudentGroups(self, student_id:str)->list[dict]:
        docs = self.db.collection(GROUPS).where(filter=FieldFilter("student_ids", "array_contains", student_id)).stream()
        docList = []
        for doc in docs:
            docList.append(doc.to_dict())
        return docList
    def getTeamJoy(self, group_id:str)->list[dict]:
        docs = self.db.collection(JOY).where(filter=FieldFilter("group_id", "==",  group_id))
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
    
    def addProject(self, course_id:str, project_id:str, project_name:str, max_group_size:int, github_repo_address:str="", group_ids:list[str]=[])->bool:
        x = [i for i in self.db.collection(PROJECTS).where(filter=FieldFilter("project_id", "==", project_id)).stream()]
        if len(x) > 0:
            return False
        template = {}
        template["course_id"] = course_id
        template["project_id"] = project_id
        template["project_name"] = project_name
        template["github_repo_address"] = github_repo_address
        template["group_ids"] = group_ids
        template["max_group_size"] = max_group_size
        self.db.collection(PROJECTS).document(project_id).set(template)
        return True
    
    def addProjectToCourse(self, project_id:str, course_id:str)->bool:
        doc = self.db.collection(COURSES).document(course_id)
        try:
            doc.update({"project_ids": ArrayUnion([project_id])})
        except:
            return False
        return True
    
    def addGroup(self, group_id:str, group_name:str, project_id:str, student_ids:list[str]=[])->bool:
        x = [i for i in self.db.collection(GROUPS).where(filter=FieldFilter("group_id", "==", group_id)).stream()]
        if len(x) > 0:
            return False
        template = {}
        template["group_id"] = group_id
        template["group_name"] = group_name
        template["project_id"] = project_id
        template["student_ids"] = student_ids
        self.db.collection(GROUPS).document(group_id).set(template)
        return True

    def addGroupToProject(self, group_id:str, project_id:str)->bool:
        doc = self.db.collection(PROJECTS).document(project_id)
        try:
            doc.update({"group_ids": ArrayUnion([group_id])})
        except:
            return False
        return True
    
    def addStudentToGroup(self, group_id:str, student_id:str)->bool:
        doc = self.db.collection(GROUPS).document(group_id)
        try:
            doc.update({"student_ids": ArrayUnion([student_id])})
        except:
            return False
        return True
    
    def addJoyRating(self, student_id:str, group_id:str, joy_rating:int, timestamp:int)->bool:
        x = [i for i in self.db.collection(JOY).where(filter=And([FieldFilter("student_id", "==", student_id), FieldFilter("timestamp", "==", timestamp), FieldFilter("group_id", "==", group_id)])).stream()]
        if len(x) > 0:
            return self.updateJoyRating(student_id, group_id, joy_rating, timestamp)
        template = {}
        template["student_id"] = student_id
        template["group_id"] = group_id
        template["joy_rating"] = joy_rating
        template["timestamp"] = timestamp
        self.db.collection(JOY).document(f"{student_id}_{group_id}_{timestamp}").set(template)
        return True

    def updateJoyRating(self, student_id:str, group_id:str, joy_rating:int, timestamp:int)->bool:
        doc = self.db.collection(JOY).document(f"{student_id}_{group_id}_{timestamp}")
        try:
            doc.update({"joy_rating": joy_rating})
        except:
            return False
        return True
    def removeCourse(self, course_id:str)->bool:
        x = [i for i in self.db.collection(COURSES).where(filter=FieldFilter("course_id", "==", course_id)).stream()]
        print(course_id)
        print(x)
        if len(x) == 0:
            return False
        try:
            self.db.collection(COURSES).document(course_id).delete()
        except:
            
            return False
     
        return True
    
    def findUser(self, email:str)->dict|None:
        docs = self.db.collection(USERS).where(filter=FieldFilter("email", "==", email)).stream()
        for doc in docs:
            return doc.to_dict()
        return None

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
    print(test.addProject("java3", "java3_proj1", "Java Project 1", 5))
    print(test.addProjectToCourse("java3_proj1", "java3"))
    print(test.addGroup("java3_proj1_gr1", "Group 1", "java3_proj1"))
    print(test.addStudentToGroup("java3_proj1_gr1", "3713652"))
    print(test.addGroupToProject("java3_proj1_gr1", "java3_proj1"))
    timestamp = datetime.datetime.strptime(datetime.datetime.now().strftime("%d/%m/%Y"), "%d/%m/%Y").timestamp()
    print(test.addJoyRating("3713652", "java3_proj1_gr1", 5, int(timestamp)))
    print(test.addJoyRating("3713652", "java3_proj1_gr1", 3, int(timestamp)))
    #print(test.removeCourse("TestCourseAgain"))
