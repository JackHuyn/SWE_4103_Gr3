import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter, And
from google.cloud.firestore_v1 import ArrayUnion
import os
import datetime
import pytz

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
        try:
            doc = self.db.collection(GROUPS).document(group_id).get()
            return doc.to_dict()['avg_joy']
        except Exception as e:
            print('DB WRAPPER ERROR')
            print(e)
            return []
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
    
    def addGroup(self, project_id:str, student_ids:list[str]=[])->bool:
        x = self.getProjectGroups(project_id)
        group_n = len(x)
        template = {}
        group_id = f"{project_id}_gr{group_n}"
        projData = self.getProjectData(project_id)
        template["group_id"] = group_id
        template["group_name"] = f"{projData["project_name"]} Group {group_n}"
        template["project_id"] = project_id
        template["student_ids"] = student_ids
        template["avg_joy"] = []
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
    
    def addJoyRating(self, student_id:str, group_id:str, joy_rating:int, comment:str)->bool:
        now = datetime.datetime.now()
        current_date = datetime.datetime(now.year, now.month, now.day, 0, 0, 0)
        timezone = pytz.timezone('UTC')  # Replace 'UTC' with your desired timezone
        midnight_utc = timezone.localize(current_date)
        firestore_timestamp = midnight_utc.isoformat()

        group = self.db.collection(GROUPS).where(filter=FieldFilter("group_id", "==", group_id)).get()
        if(group):
            g = group.to_dict()
            if 'avg_joy' in g:
                for avg in g['avg_joy']:
                    if avg['date'] >= firestore_timestamp:
                        group.update({'avg_joy': firestore.ArrayRemove(avg)})


        # if group[avg_joy] has avg for current date, delete
        # calculate avg for current date
        # if(len(existing_avg))

        if (self.updateJoyRating(student_id, group_id, joy_rating, comment)):
            return True
        timestamp = int(datetime.datetime.strptime(datetime.datetime.now().strftime("%d/%m/%Y"), "%d/%m/%Y").timestamp())
        template = {}
        template["student_id"] = student_id
        template["group_id"] = group_id
        template["joy_rating"] = joy_rating
        template["comment"] = comment
        template["timestamp"] = firestore.SERVER_TIMESTAMP
        self.db.collection(JOY).document(f"{student_id}_{group_id}_{timestamp}").set(template)
        return True
    
    def calculateJoyAverage(self, group_id:str, date):
        date_start = datetime.datetime(date.year, date.month, date.day, 0, 0, 0)
        date_end = datetime.datetime(date.year, date.month, date.day, 23, 59, 59)
        timezone = pytz.timezone('UTC')  # Replace 'UTC' with your desired timezone
        date_start_utc = timezone.localize(date_start)
        date_end_utc = timezone.localize(date_end)
        firestore_timestamp_start = date_start_utc.isoformat()
        firestore_timestamp_end = date_end_utc.isoformat()

        sum = 0
        joy_docs = self.db.collection(JOY).where(
            filter=FieldFilter("group_id", "==", group_id)).where(
                filter=FieldFilter("timestamp", ">=", firestore_timestamp_start)).where(
                    filter=FieldFilter("timestamp", "<=", firestore_timestamp_end)).stream()
        for doc in joy_docs:
            d = doc.to_dict()
            sum += d['joy_rating']
        avg = sum / len(joy_docs)
        return {}


    def updateJoyRating(self, student_id:str, group_id:str, joy_rating:int, comment:str)->bool:
        timestamp = int(datetime.datetime.strptime(datetime.datetime.now().strftime("%d/%m/%Y"), "%d/%m/%Y").timestamp())
        doc = self.db.collection(JOY).document(f"{student_id}_{group_id}_{timestamp}")
        try:
            doc.update({"joy_rating": joy_rating})
            doc.update({"comment": comment})
            doc.update({"timestamp": firestore.SERVER_TIMESTAMP})
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
    def findUser(self, email:str)->dict|None:
        docs = self.db.collection(USERS).where(filter=FieldFilter("email", "==", email)).stream()
        for doc in docs:
            return doc.to_dict()
        return None
    
    # Project Access Functions
    def getRecentStudentJoyRatings(self, group_id:str) -> dict:
        docs = self.db.collection(JOY).where(filter=FieldFilter("group_id", "==", group_id)).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()
        user_ids = []
        docList = []
        for doc in docs:
            d = doc.to_dict()
            if(d['student_id'] in user_ids):
                continue
            print('D: ', d)
            d['date'] = str(d['timestamp'])
            d.pop('timestamp', None)
            docList.append(d)
            user_ids.append(d['student_id'])
        return docList
    
    def getGithubRepoAddress(self, group_id:str):
        docs = self.db.collection(GROUPS).document(group_id).get()
        return docs.to_dict()['github_repo_address']



    

if __name__ == "__main__":
    FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'
    credFileName = "swe4103-7b261-firebase-adminsdk.json"

    dir_path = os.path.dirname(os.path.realpath(__file__))
    cred = credentials.Certificate(dir_path + "/../" + credFileName)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    test = DbWrapper(db)
    print(test.addStudentJoyRatings('TEMPLATE', 'python_test', 4))
    print(test.getStudentJoyRatings('TEMPLATE'))
    # docs = test.getStudentCourses("3713652")
    # print(docs)
    # print(test.addStudentToCourse("3713652", "TestCourse"))
    # print(test.getUserData("TestUser"))
    # print(test.addUser(1,"test111@unb.ca","Test","Account","some_student"))
    # print(test.addCourse("Another Test Course", "TestCourseAgain", ["some_prof"], "FR01A", "FA2024"))
    # print(test.activateCourse("TestCourseAgain"))
    # print(test.getInstructorCourses("some_prof"))
    #print(test.removeCourse("TestCourseAgain"))
