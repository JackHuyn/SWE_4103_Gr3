import firebase_admin
from firebase_admin import auth, credentials, firestore
import firebase_admin.firestore
from google.cloud.firestore_v1.base_query import FieldFilter, And
from google.cloud.firestore_v1 import ArrayUnion
import os
import datetime

COURSES = "coursedata"
GROUPS = "groupdata"
PROJECTS = "projectdata"
USERS = "userdata"
JOY = "joydata"
VELOCITY = "velocitydata"

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
    def getProjectGroups(self, project_id:str)->list[dict]:
        docs = self.db.collection(GROUPS).where(filter=FieldFilter("project_id", "==", project_id)).stream()
        docList = []
        for doc in docs:
            docList.append(doc.to_dict())
        return docList
    def getCourseProjects(self, course_id:str)->dict:
        docs = self.db.collection(PROJECTS).where(filter=FieldFilter("course_id", "==", course_id)).stream()
        docList = []
        for doc in docs:
            docList.append(doc.to_dict())
        return docList
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
        docs = self.db.collection(JOY).where(filter=FieldFilter("group_id", "==",  group_id)).stream()
        docList = []
        for doc in docs:
            docList.append(doc.to_dict())
        return docList
    def getTeamVelocity(self, group_id:str)->list[dict]:
        docs = self.db.collection(VELOCITY).where(filter=FieldFilter("group_id", "==", group_id)).stream()
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
    def addGithubTokenToUser(self, uid:str, github_personal_access_token:str)->bool:
        doc = self.db.collection(USERS).document(uid)
        try:
            doc.update({"github_personal_access_token": github_personal_access_token})
        except:
            return False
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
    def addCourse(self, course_description:str, course_id:str, instructor_ids:list[str], section:str, term:str, student_ids=[], status=0)->bool:
        x = [i for i in self.db.collection(COURSES).where(filter=FieldFilter("course_id", "==", course_id)).stream()]
        if len(x) > 0:
            return False
        template = {}
        template["course_description"] = course_description
        template["course_id"] = course_id
        template["instructor_ids"] = instructor_ids
        template["section"] = section
        template["term"] = term
        template["status"] = status
        template["student_ids"] = student_ids
        self.db.collection(COURSES).document(course_id).set(template)
        return True
    
    def addProject(self, course_id:str, project_id:str, project_name:str, github_repo_address:str="")->bool:
        x = [i for i in self.db.collection(PROJECTS).where(filter=FieldFilter("project_id", "==", project_id)).stream()]
        if len(x) > 0:
            return False
        template = {}
        template["course_id"] = course_id
        template["project_id"] = project_id
        template["project_name"] = project_name
        template["github_repo_address"] = github_repo_address
        self.db.collection(PROJECTS).document(project_id).set(template)
        return True
    
    def addGroup(self, project_id:str, student_ids:list[str]=[], github_repo_address:str="", scrum_master:list[str]="")->bool:
        x = self.getProjectGroups(project_id)
        group_n = len(x) + 1
        template = {}
        group_id = f"{project_id}_gr{group_n}"
        projData = self.getProjectData(project_id)
        template["group_id"] = group_id
        template["group_name"] = f"{projData["project_name"]} Group {group_n}"
        template["project_id"] = project_id
        template["student_ids"] = student_ids
        template["github_repo_address"] = github_repo_address
        template["scrum_master"] = scrum_master
        inserted = False
        while(not inserted):
            x = [i for i in self.db.collection(GROUPS).where(filter=FieldFilter("group_id", "==", group_id)).stream()]
            if len(x) > 0:
                group_n -= 1
                group_id = f"{project_id}_gr{group_n}"
                template["group_id"] = group_id
            else:
                self.db.collection(GROUPS).document(group_id).set(template)
                inserted = True
        return True
    
    def addGithubRepoToGroup(self, group_id:str, github_repo_address:str)->bool:
        doc = self.db.collection(GROUPS).document(group_id)
        try:
            doc.update({"github_repo_address": github_repo_address})
        except:
            return False
        return True

    def addNGroups(self, project_id:str, n:int)->bool:
        for i in range(n):
            self.addGroup(project_id)
        return True
    
    def addStudentToGroup(self, group_id:str, student_id:str)->bool:
        doc = self.db.collection(GROUPS).document(group_id)
        try:
            doc.update({"student_ids": ArrayUnion([student_id])})
        except:
            return False
        return True
    
    def addScrumMasterToGroup(self, group_id:str, scrum_master:list[str]="")->bool:
        doc = self.db.collection(GROUPS).document(group_id)
        try:
            doc.update({"scrum_master": scrum_master})
        except:
            return False
        return True
    
    def addJoyRating(self, student_id:str, group_id:str, joy_rating:int)->bool:
        if (self.updateJoyRating(student_id, group_id, joy_rating)):
            return True
        timestamp = int(datetime.datetime.strptime(datetime.datetime.now().strftime("%d/%m/%Y"), "%d/%m/%Y").timestamp())
        template = {}
        template["student_id"] = student_id
        template["group_id"] = group_id
        template["joy_rating"] = joy_rating
        template["timestamp"] = firestore.SERVER_TIMESTAMP
        self.db.collection(JOY).document(f"{student_id}_{group_id}_{timestamp}").set(template)
        return True
    
    def addVelocityData(self, group_id:str, sprint_start:datetime.datetime, sprint_end:datetime.datetime, planned_points:int, completed_points:int=0)->bool:
        sprints = self.getTeamVelocity(group_id)
        sprint_num = len(sprints) + 1
        docId = f"{group_id}_Sprint{sprint_num}"
        template = {}
        template['group_id'] = group_id
        template['sprint_num'] = sprint_num
        template['sprint_start'] = sprint_start
        template['sprint_end'] = sprint_end
        template['planned_points'] = planned_points
        template['completed_points'] = completed_points
        inserted = False
        while(not inserted):
            x = [i for i in self.db.collection(VELOCITY).where(filter=FieldFilter("sprint_id", "==", group_id)).stream()]
            if len(x) > 0:
                sprint_num += 1
                docId = f"{group_id}_Sprint{sprint_num}"
                template["sprint_id"] = sprint_num
            else:
                self.db.collection(VELOCITY).document(docId).set(template)
                inserted = True
        return True

    def updateJoyRating(self, student_id:str, group_id:str, joy_rating:int)->bool:
        timestamp = int(datetime.datetime.strptime(datetime.datetime.now().strftime("%d/%m/%Y"), "%d/%m/%Y").timestamp())
        doc = self.db.collection(JOY).document(f"{student_id}_{group_id}_{timestamp}")
        try:
            doc.update({"joy_rating": joy_rating})
            doc.update({"timestamp": firestore.SERVER_TIMESTAMP})
        except:
            return False
        return True
    
    def updateVelocityData(self, velocity_id:str, sprint_start:datetime.datetime=-1, sprint_end:datetime.datetime=-1, planned_points:int=-1, completed_points:int=-1)->bool:
        doc = self.db.collection(VELOCITY).document(velocity_id)
        try:
            if sprint_start != -1:
                doc.update({'sprint_start': sprint_start})
            if sprint_end != -1:
                doc.update({'sprint_end': sprint_end})
            if planned_points != -1:
                doc.update({'planned_points': planned_points})
            if completed_points != -1:
                doc.update({'completed_points': completed_points})
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
    def removeProject(self, project_id:str)->bool:
        x = [i for i in self.db.collection(PROJECTS).where(filter=FieldFilter("project_id", "==", project_id)).stream()]
        if len(x) == 0:
            return False
        proj_data = x[0].to_dict()
        groups = self.getProjectGroups(proj_data["project_id"])
        for e in groups:
            self.removeGroup(e["group_id"])
        try:
            self.db.collection(PROJECTS).document(project_id).delete()
        except:
            return False
        return True
    def removeGroup(self, group_id:str)->bool:
        x = [i for i in self.db.collection(GROUPS).where(filter=FieldFilter("group_id", "==", group_id)).stream()]
        if len(x) == 0:
            return False
        try:
            self.db.collection(GROUPS).document(group_id).delete()
        except:
            return False
        return True
    def removeVelocity(self, velocity_id:str):
        try:
            self.db.collection(VELOCITY).document(velocity_id).delete()
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
    print(test.addGroup("java3_proj1"))
    print(test.addStudentToGroup("java3_proj1_gr1", "3713652"))
    print(test.addJoyRating("3713652", "java3_proj1_gr1", 5))
    print(test.addJoyRating("3713652", "java3_proj1_gr1", 3))
    print(test.addNGroups("java3_proj1", 5))
    print(test.removeGroup("java3_proj1_gr1"))
    print(test.addGroup("java3_proj1"))
    print(test.removeProject("java3_proj1"))
    print(test.addVelocityData("java3_proj1_gr1", datetime.datetime.strptime("2024/11/01", "%Y/%m/%d"), datetime.datetime.strptime("2024/11/05", "%Y/%m/%d"), 20))
    print(test.updateVelocityData("java3_proj1_gr1_Sprint1", completed_points=15))
    print(test.getTeamVelocity("java3_proj1_gr1"))
    print(test.removeVelocity("java3_proj1_gr1_Sprint1"))
    #print(test.removeCourse("TestCourseAgain"))
