#Third Party Libraries
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import FileUpload as fp
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
import requests
import os
from github import BadCredentialsException

#First Party Libraries
import Auth as fb_auth
import FileUpload as fp
from DbWrapper.DbWrapper import DbWrapper
import StudentMetrics as StudentMetrics
import User as User
import GitHub as Github


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'
credFileName = "swe4103-7b261-firebase-adminsdk.json"
github_api_key_filename = 'swe4103-github-metrics-admin.json'

dir_path = os.path.dirname(os.path.realpath(__file__))
cred = credentials.Certificate(os.path.join(dir_path, credFileName))
firebase_admin.initialize_app(cred)
db = firestore.client()
dbWrapper = DbWrapper(db)

metrics = StudentMetrics.StudentMetrics(dbWrapper)
with(open(os.path.join(dir_path, github_api_key_filename), "r") as key_file):
    github_api_key = json.load(key_file)

firebase_auth = fb_auth.FirebaseAuth(dbWrapper, auth, FIREBASE_WEB_API_KEY)



@app.route('/', methods=['GET'])
@cross_origin()
def get_home():
    return 'Welcome!'



@app.route('/auth/signup-with-email-and-password', methods=['POST'])
@cross_origin()
def signup_user():
    
    fname = request.args.get("fname", default = "", type = str)
    lname = request.args.get("lname", default = "", type = str)
    email = request.args.get("email", default = "", type = str)
    password = request.args.get("password", default = "", type = str)
    account_type = request.args.get("accountType", default = -1, type = int)
    instructor_key = request.args.get("instructorKey", default = "", type = str)
    try:
        if(account_type == 1 and not firebase_auth.validate_instructor_key(instructor_key)):
            raise fb_auth.InvalidInstructorKeyException
        if (account_type == -1):
            raise Exception
        signup_resp = firebase_auth.sign_up_with_email_and_password(fname, lname, email, password)

        dbWrapper.addUser(account_type,email,fname,lname,signup_resp.uid)
        
        
        print(signup_resp)
        response = app.response_class(
            response=json.dumps({'approved': True}),
            status=(200),
            mimetype='application/json'
        )
        return response
    except fb_auth.InvalidInstructorKeyException as iike:
        print(iike)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Instructor Key Error'}),
            status=(401),
            mimetype='application/json'
        )
        return response
    except auth.EmailAlreadyExistsError as eaee:
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Account with this Email Already Exists'}),
            status=(401),
            mimetype='application/json'
        )
        return response
    except Exception as e:
        print(e)
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=(500),
            mimetype='application/json'
        )
        return response
    
@app.route('/auth/validate-instructor-key', methods=['GET'])
@cross_origin()
def validate_instructor_key():
    key = request.args.get("instructorKey", default = "", type = str)
    if firebase_auth.validate_instructor_key(key):
        response = app.response_class(
            response=json.dumps({'approved': True}),
            status=200,
            mimetype='application/json'
        )
    else:
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/auth/login-with-email-and-password', methods=['GET'])
@cross_origin()
def login_user():
    email = request.args.get("email", default = -1, type = str)
    password = request.args.get("password", default = -1, type = str)
    try:
        user_obj = firebase_auth.sign_in_with_email_and_password(email, password)
        response = app.response_class(
            response=json.dumps({'approved': True, 'localId': user_obj.local_id, 'idToken': user_obj.id_token}),
            status=200,
            mimetype='application/json'
        )
        response.set_cookie('idToken', user_obj.id_token, httponly=True, secure=True, samesite='Strict', path='/')
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

#Helper to access user role 
def getUserRole(local_id):
    user_data = dbWrapper.getUserData(local_id)
    return user_data['account_type']

#Helper to get student list in course
def getStudentList(local_id):
    course_data = dbWrapper.getCourseData(local_id)
    return course_data['student_ids']

#Author: Raphael Ferreira 
@app.route('/check-instructor',methods=['GET'])
@cross_origin()
def check_instructor_role():
    local_id = request.args.get("localId", default=-1,type=str)
    user_data = dbWrapper.getUserData(local_id) #If any errors, ensure that this user exists in firestore users document
    
    if(user_data['account_type'] == 1):
        response = app.response_class(
        response=json.dumps({'approved': True}),
        status=200,
        mimetype='application/json'
    )
        
    else:
        #This is a student account
        response = app.response_class(
            response = json.dumps({'approved': False}),
            status = 401,
            mimetype = 'application/json'
        )

    return response

    
    

@app.route('/auth/validate-session', methods=['GET'])
@cross_origin()
def validate_session():
    local_id = request.args.get("localId", default = -1, type = str)
    id_token = request.args.get("idToken", default = -1, type = str)
    valid = firebase_auth.validate_token(local_id, id_token)
    response = app.response_class(
        response=json.dumps({'approved': valid}),
        status=200 if valid else 401,
        mimetype='application/json'
    )
    print(response.response)
    return response

@app.route('/auth/logout', methods=['GET'])
@cross_origin()
def logout_user():
    print('in logout')
    local_id = request.args.get("localId", default = -1, type = str)
    if firebase_auth.end_session(local_id):
        response = app.response_class(
            response=json.dumps({'approved': True }),
            status=200,
            mimetype='application/json'
        )
    else:
        response = app.response_class(
            response = json.dumps({'approved': False}),
            status = 401,
            mimetype = 'application/json'
        )
    return response


#Author: Raphael Ferreira
#Handles routing for file uploads 
@app.route('/upload_file', methods=['GET','POST'])
@cross_origin()
def upload():
    if 'file' not in request.files:
        response = app.response_class(
            response=json.dumps({}),
            status=401,
            mimetype='application/json'
        )
        return response  
    
    file = request.files['file']
    course_id = request.form.get('course_id')
        #would need to confirm that I am logged in using validate_session or firebase_auth.validate_token ? 
        #valid = True
    response = app.response_class(
        response=json.dumps({'approved': True }),
        status = 200, 
        mimetype = 'application/json'
    )
    if file.filename == '':
        response = app.response_class(
            response = json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
        return response
    if file and fp.allowed_file(file.filename):
        saved_file_path = fp.save_file(file) 
        list_of_emails = fp.extract_email(saved_file_path)
        list_of_students = fp.extract_student_info(saved_file_path)
        print(list_of_emails)
        users_not_found = []

        #------- create account for invalid student and all in the class -------
        for info in list_of_students:
            fname = info.split(",")[0]
            lname = info.split(",")[1]
            email = info.split(",")[2]
            student_dict = dbWrapper.findUser(email)
            if student_dict != None:
                student_id = student_dict['uid']
                if dbWrapper.addStudentToCourse(student_id, course_id):
                    print(student_id + ': Add\tDone')
                else:
                    print(student_id + ': Add\tFail')
            else:
                student_resp = firebase_auth.sign_up_with_email_and_password(fname, lname, email, email) #password is email by default
                if dbWrapper.addUser(0,email,fname,lname,student_resp.uid):
                    student_id = student_resp.uid
                    print(student_id + ': Create\tDone')
                    if dbWrapper.addStudentToCourse(student_id, course_id):
                        print(student_id + ': Add\tDone')
                    else:
                        print(student_id + ': Add\tFail')
                else:
                    print(student_resp.uid + ': Create\tFail')
        #----------------------------------------------------------------------
        
        response = app.response_class(
            response = json.dumps({'approved': True}),
            status = 200,
            mimetype = 'application/json'
        )
        return response
    

    
# Author: Namneet, Raphael, Sarun
# handles adding courses    

@app.route('/add-course', methods=['POST'])
@cross_origin()  # Enable CORS for this route
def add_course():
    try:
        
        # Extract course details from the request JSON body
        data = request.get_json()
        
        # Extract the fields from the JSON object
        course_name = data.get('course_name', "")
        course_description = data.get('course_description', "")
        course_term = data.get('course_term', "")
        course_section = data.get('course_section', "")
        instructor_ids = data.get('instructor_ids',[])

        print(course_name)
        print(course_description)
        print(course_term)
        print(course_section)
        print(instructor_ids)

        # Check if all required fields are provided
        if not (course_name and course_description and course_term and course_section):
            raise ValueError("Missing required fields")

        # Call the `addCourse` function from `DbWrapper`
        success = dbWrapper.addCourse(
            course_description=course_description,
            course_id=course_name,
            instructor_ids=instructor_ids,
            section=course_section,
            term=course_term,
            student_ids=[]
        )  

        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Course added successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to add course'}),
                status=500,
                mimetype='application/json'
            )

        return response

    except ValueError as ve:
        print(ve)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': str(ve)}),
            status=400,
            mimetype='application/json'
        )
        return response

    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response
        

    

@app.route('/remove-course', methods=['POST'])
@cross_origin()  # Enable CORS for this route
def remove_course():
    try:
        
        # Extract course details from the request JSON body
        data = request.get_json()
        
        # Extract the fields from the JSON object
        course_name = data.get('course_name', "")
        print(course_name)
        print(type(course_name))


        # Check if all required fields are provided
        if not (course_name):
            raise ValueError("Missing required fields")

        # Call the `removeCourse` function from `DbWrapper`
        success = dbWrapper.removeCourse(
            course_id=course_name
        )

        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Course removed successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to remove course'}),
                status=500,
                mimetype='application/json'
            )
        return response

    except ValueError as ve:
        print(ve)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': str(ve)}),
            status=400,
            mimetype='application/json'
        )
        return response

    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response    

@app.route('/auth/course_home_page', methods = ["GET"])
@cross_origin()
def get_course_data():
    local_id = request.args.get("localId", default = '-1', type=str)
    course_id = request.args.get("courseId", default= '-1', type=str)
    print('We have the course_id of : ', course_id)
    if local_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'No/wrong id'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    
    
    #To Do: Get projects data
    #To Do: Check Role ?

    try: 
        course_data = dbWrapper.getCourseData(course_id)
        response = app.response_class(
            response=json.dumps({'approved': True, 'id': 'valid'}),
            status = 200,
            mimetype='applicaion/json'
        )

        if course_data:
            # Convert dictionary to JSON for frontend use
            print("converting")
            response = app.response_class(
                response=json.dumps({
                    'approved': True,
                    'courses': course_data
                }),
                status=200,
                mimetype='application/json'
            )
            return response
        
        elif course_data == []:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 200,
              mimetype='applicaion/json'
            )
            return response



        else:
            # handle any other unexpected exist
            
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 401,
              mimetype='applicaion/json'
            )
            return response
    # error
    except Exception as e:
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Error fetching data', 'error': str(e)}),
            status=500,
            mimetype='application/json'
        )
        return response

    
#----------------------------------
#Author: Sarun Weerakul
#This route displays student info
@app.route('/auth/course/students_info', methods= ['GET', 'POST'])
@cross_origin()
def show_student():
    local_id = request.args.get("localId", default = -1, type = str)
    course_id = request.args.get("courseId", default = -1, type = str)
    print('user ID is : ', local_id)
    print('course id : ', course_id)
    if local_id == -1: 
        response = app.response_class(
            response=json.dumps({'error': 'No/wrong id'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    elif course_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'Invalid course'}),
            status = 401,
            mimetype='application/json'
        )
    try:
        course_data_students = (dbWrapper.getCourseData(course_id))['student_ids']
        students = []
        for student in course_data_students:
            toadd = dbWrapper.getUserData(student)
            students.append(toadd)
        response = app.response_class(
            response=json.dumps({'approved': True, 'id': 'valid'}),
            status = 200,
            mimetype='applicaion/json'
        )
        if students:
            print("converting")
            response = app.response_class(
                response=json.dumps({
                    'approved': True,
                    'students': students
                }),
                status=200,
                mimetype='application/json'
            )
            return response
        elif course_data_students == []:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 200,
              mimetype='applicaion/json'
            )
            return response
        else:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 401,
              mimetype='applicaion/json'
            )
            return response
    except Exception as e:
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Error fetching data', 'error': str(e)}),
            status=500,
            mimetype='application/json'
        )
        return response
#----------------------------------
#Author: Sarun Weerakul
#This route adds a student to course
@app.route('/add-a-student', methods=['POST'])
@cross_origin()
def add_a_student():
    try:
        data = request.get_json()
        course_id = data.get('course_id','')
        student_fname = data.get('student_fname','')
        student_lname = data.get('student_lname','')
        student_email = data.get('student_email','')
        success = False
        if not (course_id or student_fname or student_lname or student_email):
            raise ValueError("Missing required fields")
        student_dict = dbWrapper.findUser(student_email)
        if student_dict != None:
            student_id = student_dict['uid']
            if dbWrapper.addStudentToCourse(student_id, course_id):
                success = True
                print(student_id + ': Add\tDone')
            else:
                print(student_id + ': Add\tFail')
        else:
            student_resp = firebase_auth.sign_up_with_email_and_password(student_fname,student_lname,student_email,student_email) #password is email by default
            if dbWrapper.addUser(0,student_email,student_fname,student_lname,student_resp.uid):
                student_id = student_resp.uid
                print(student_id + ': Create\tDone')
                if dbWrapper.addStudentToCourse(student_id, course_id):
                    success = True
                    print(student_id + ': Add\tDone')
                else:
                    print(student_id + ': Add\tFail')
            else:
                print(student_resp.uid + ': Create\tFail')
        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Student added successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to add student'}),
                status=500,
                mimetype='application/json'
            )
        return response
    except ValueError as ve:
        print(ve)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': str(ve)}),
            status=400,
            mimetype='application/json'
        )
        return response
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response
#----------------------------------
#Author: Sarun Weerakul
#This route remove project from course
@app.route('/remove-project', methods=['POST'])
@cross_origin()
def remove_project():
    try:
        data = request.get_json()
        course_id = data.get('course_id',"")
        project_name = data.get('project_name', "")
        print(project_name)
        print(type(project_name))
        if not (project_name):
            raise ValueError("Missing required fields")
        course_data_projects = (dbWrapper.getCourseProjects(course_id))
        project_id = ""
        for project in course_data_projects:
            if project_name == project['project_name']:
                project_id = project['project_id']
                break
        if project_id == "":
            raise ValueError("Project not found")
        success = dbWrapper.removeProject(project_id)
        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Project removed successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to remove project'}),
                status=500,
                mimetype='application/json'
            )
        return response
    except ValueError as ve:
        print(ve)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': str(ve)}),
            status=400,
            mimetype='application/json'
        )
        return response
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response    
#----------------------------------
#Author: Sarun Weerakul
#This route remove students from course
@app.route('/remove-students-course', methods=['POST'])
@cross_origin()
def remove_students_course():
    try:
        data = request.get_json()
        course_id = data.get('course_id',"")
        remove_list = data.get('remove_list', [])
        success = False
        for student in remove_list:
            print(student['uid'])
            success = True
        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Students removed successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to remove students'}),
                status=500,
                mimetype='application/json'
            )
        return response
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response    
#----------------------------------
#Author: Sarun Weerakul
#This route remove groups from project
@app.route('/remove-groups', methods=['POST'])
@cross_origin()
def remove_groups():
    try:
        data = request.get_json()
        remove_list = data.get('remove_list', [])
        success = False
        for group in remove_list:
            if dbWrapper.removeGroup(group['group_id']):
                success = True
            else:
                success = False
                break
        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Groups removed successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to remove groups'}),
                status=500,
                mimetype='application/json'
            )
        return response
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response    
#----------------------------------

# Jack Huynh _ Show courses 
@app.route('/auth/courses', methods= ["GET"])
@cross_origin()
def show_courses():
    # get student id from the current login
    local_id = request.args.get("localId", default = -1, type = str)
    print('user ID is : ', local_id)
    # handle wrong student id case
    if local_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'No/wrong id'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    try:  
        # get user data by role
        role = getUserRole(local_id)

        if (role == 1):
            # Fetch instructor courses
            user_data_courses = dbWrapper.getInstructorCourses(local_id)
        else:
            # Fetch student courses
            user_data_courses = dbWrapper.getStudentCourses(local_id)

        response = app.response_class(
            response=json.dumps({'approved': True, 'id': 'valid'}),
            status = 200,
            mimetype='applicaion/json'
        )

        # if data exist?
        if user_data_courses:
            # Convert dictionary to JSON for frontend use
            print("converting")
            response = app.response_class(
                response=json.dumps({
                    'approved': True,
                    'courses': user_data_courses
                }),
                status=200,
                mimetype='application/json'
            )
            return response
        
        elif user_data_courses == []:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 200,
              mimetype='applicaion/json'
            )
            return response



        else:
            # handle any other unexpected exist
            
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 401,
              mimetype='applicaion/json'
            )
            return response
    # error
    except Exception as e:
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Error fetching data', 'error': str(e)}),
            status=500,
            mimetype='application/json'
        )
        return response
    

@app.route('/metrics/get-avg-team-joy-ratings', methods=['GET'])
@cross_origin()
def get_team_joy_ratings(): # Avg Joy Ratings per Day
    group_id = request.args.get("groupId", default = "", type = str)
    try:
        joy_data = metrics.get_avg_team_joy_ratings(group_id)
        print('JOY DATA: ', joy_data)
        response = app.response_class(
            response=json.dumps({'approved': True, 'joyData': joy_data}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print('BACKEND ERROR')
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/metrics/get-student-joy-ratings', methods=['GET'])
@cross_origin()
def get_student_joy_ratings(): # Avg Joy Ratings per Day
    group_id = request.args.get("groupId", default = "", type = str)
    try:
        joy_data = metrics.get_recent_student_joy_ratings(group_id)
        response = app.response_class(
            response=json.dumps({'approved': True, 'joyData': joy_data}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/metrics/submit-joy-rating', methods=['POST'])
@cross_origin()
def submit_student_joy_rating():
    group_id = request.args.get("groupId", default = "", type = str)
    uid = request.args.get("uid", default = "", type = str)
    joy_rating = request.args.get("joyRating", default = "", type = str)
    comment = request.args.get("comment", default = "", type = str)

    try:
        joy_data = metrics.add_student_joy_rating(group_id, uid, joy_rating, comment)
        response = app.response_class(
            response=json.dumps({'approved': True}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/metrics/contributions', methods=['GET'])
@cross_origin()
def get_github_contribution_stats():
    local_id = request.args.get("localId", default = "", type = str)
    group_id = request.args.get("groupId", default = "", type = str)
    try:
        user_obj = firebase_auth.active_sessions[local_id]
        auth = user_obj.github_auth
        resp = metrics.get_github_contribution_stats(auth, group_id)
        print(resp)
        response = app.response_class(
            response=json.dumps({'approved': True, 'contributions': resp}),
            status=200,
            mimetype='application/json'
        )
    except (User.InvalidGitHubAuthException, BadCredentialsException) as igae:
        print("Invalid GitHub Authentication")
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=498, # (Unreserved) Invalid GitHub Authentication
            mimetype='application/json'
        )
    except Exception as ex:
        # print('Exception: ', e)
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        print(message)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/metrics/get-team-velocity', methods=['GET'])
@cross_origin()
def get_team_velocity():
    group_id = request.args.get("groupId", default = "", type = str)
    try:
        resp = metrics.get_team_velocity(group_id)
        # print(resp)
        response = app.response_class(
            response=json.dumps({'approved': True, 'velocity': resp}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/metrics/submit-team-velocity', methods=['POST'])
@cross_origin()
def sumbit_team_velocity():
    local_id = request.args.get("localId", default = "", type = str)
    group_id = request.args.get("groupId", default = "", type = str)
    start_date = request.args.get("startDate", default = "", type = str)
    end_date = request.args.get("endDate", default = "", type = str)
    planned_story_points = request.args.get("plannedStoryPoints", default = "", type = str)
    completed_story_points = request.args.get("completedStoryPoints", default = "", type = str)

    try:
        metrics.submit_team_velocity(group_id, start_date, end_date, planned_story_points, completed_story_points)
        response = app.response_class(
            response=json.dumps({'approved': True}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response


@app.route('/auth/get-github-app-client-id', methods=['GET'])
@cross_origin()
def get_github_app_client_id():
    try:
        response = app.response_class(
            response=json.dumps({'approved': True, 'clientId': github_api_key['client_id']}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response

@app.route('/auth/github-code-request', methods=['POST'])
@cross_origin()
def github_code_request():
    local_id = request.args.get("localId", default = "", type = str)
    id_token = request.args.get("idToken", default = "", type = str)
    code = request.args.get("code", default = "", type = str)
    try:
        print('a')
        oauth_token = Github.getOAuthTokenFromCode(github_api_key['client_id'], github_api_key['client_secret'], code)
        print('b')
        print("OAuth Token Resp: ", oauth_token)
        uid = firebase_auth.active_sessions[local_id].uid
        dbWrapper.updateGithubOAuthToken(uid, oauth_token)
        firebase_auth.active_sessions[local_id].github_oauth_token = oauth_token
        response = app.response_class(
            response=json.dumps({'approved': True}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )
    return response
# Author:  Raphael Ferreira
#This route displays all course related projects
@app.route('/auth/projects', methods= ["GET"])
@cross_origin()
def show_projects():
    # get student id from the current login
    local_id = request.args.get("localId", default = -1, type = str)
    course_id = request.args.get("courseId", default = -1, type = str)
    print('user ID is : ', local_id)
    print('course id : ', course_id)
    # handle wrong student id case
    if local_id == -1: 
        response = app.response_class(
            response=json.dumps({'error': 'No/wrong id'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    elif course_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'Invalid course'}),
            status = 401,
            mimetype='application/json'
        )
    try:  
        
        course_data_projects = dbWrapper.getCourseProjects(course_id)

        response = app.response_class(
            response=json.dumps({'approved': True, 'id': 'valid'}),
            status = 200,
            mimetype='applicaion/json'
        )

        # if data exist?
        if course_data_projects:
            # Convert dictionary to JSON for frontend use
            print("converting")
            response = app.response_class(
                response=json.dumps({
                    'approved': True,
                    'projects': course_data_projects
                }),
                status=200,
                mimetype='application/json'
            )
            return response
        
        elif course_data_projects == []:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 200,
              mimetype='applicaion/json'
            )
            return response



        else:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 401,
              mimetype='applicaion/json'
            )
            return response
    # error
    except Exception as e:
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Error fetching data', 'error': str(e)}),
            status=500,
            mimetype='application/json'
        )
        return response
    

# Author:  Raphael Ferreira
#This route displays all groups
@app.route('/show_groups', methods= ["GET"])
@cross_origin()
def show_groups():
    # get student id from the current login
    local_id = request.args.get("localId", default = -1, type = str)
    project_id = request.args.get("projectId", default = -1, type = str)
    print('user ID is : ', local_id)
    print('project id : ', project_id)
    # handle wrong student id case
    if local_id == -1: 
        response = app.response_class(
            response=json.dumps({'error': 'No/wrong id'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    elif project_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'Invalid course'}),
            status = 401,
            mimetype='application/json'
        )
    try:  
        
        list_of_groups = dbWrapper.getProjectGroups(project_id)
      

        response = app.response_class(
            response=json.dumps({'approved': True, 'id': 'valid'}),
            status = 200,
            mimetype='applicaion/json'
        )


        if list_of_groups:
            
            print("converting")
            response = app.response_class(
                response=json.dumps({
                    'approved': True,
                    'groups': list_of_groups
                }),
                status=200,
                mimetype='application/json'
            )
            return response
        
        elif list_of_groups == []:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 200,
              mimetype='applicaion/json'
            )
            return response



        else:
            response = app.response_class(
              response=json.dumps({'approved':False, 'reason':'No data found'}),
              status = 401,
              mimetype='applicaion/json'
            )
            return response
    # error
    except Exception as e:
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Error fetching data', 'error': str(e)}),
            status=500,
            mimetype='application/json'
        )
        return response
    
#This route adds a project to the database
#Author: Raphael Ferreira
@app.route('/add-project', methods=['POST'])
@cross_origin()  # Enable CORS for this route
def add_project():
    try:
        
        # Extract course details from the request JSON body
        data = request.get_json()
        
        # Extract the fields from the JSON object
        course_id = data.get('course_id', "")
        project_name = data.get('project_name', "")
        project_id = course_id + "_" +  project_name
        
        github_repo_address = data.get('github_repo_addres', "")
    
        print('course id: ', course_id)
        print('project id : ', project_id)
        print('project name: ', project_name)
        print('github_repo_address', github_repo_address) 
        # Check if all required fields are provided
        if not (project_id):
            raise ValueError("Missing required fields")

        # Call the `addCourse` function from `DbWrapper`
        success = dbWrapper.addProject(
            course_id,
            project_id,
            project_name,
            github_repo_address
        )  

        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Project added successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to add project'}),
                status=500,
                mimetype='application/json'
            )

        return response

    except ValueError as ve:
        print(ve)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': str(ve)}),
            status=400,
            mimetype='application/json'
        )
        return response

    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response
    
#Author: Raphael Ferreira
@app.route('/add-group', methods=['POST'])
@cross_origin()  # Enable CORS for this route
def add_group():
    try:
        
        # Extract course details from the request JSON body
        data = request.get_json()
        
        # Extract the fields from the JSON object
        #course_id = data.get('group_name', "")
        project_id = data.get('project_id', "")
        n_groups = int(data.get('n_groups',"1"))
        #github_repo_address = data.get('github_repo_addres', "")
    
        #print('course id: ', course_id)
        print('project id : ', project_id)

        
        #print('project name: ', project_name)
        #print('github_repo_address', github_repo_address) 
        # Check if all required fields are provided
        if not (project_id):
            raise ValueError("Missing required fields")

        # Call the `addCourse` function from `DbWrapper`

        if (n_groups == 1):
            success = dbWrapper.addGroup(
                project_id,
                #Hard coded students : test@unb.ca, anon@anon.com, will@unb.ca
                ['x4jaePpUW0Vnz8zB8BNFWy2HXYB2', 'vTRZQxoDzWTtPYCOPr8LxIcJk702', 'G4rI7g4ChTbkkQwtXjZBxaI7fRj1']  # Hard coding students for now
            )
        
        else:
            success = dbWrapper.addNGroups(project_id,n_groups)

        
        if success:
            response = app.response_class(
                response=json.dumps({'approved': True, 'message': 'Group added successfully'}),
                status=200,
                mimetype='application/json'
            )
        else:
            response = app.response_class(
                response=json.dumps({'approved': False, 'reason': 'Failed to add group'}),
                status=500,
                mimetype='application/json'
            )

        return response

    except ValueError as ve:
        print(ve)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': str(ve)}),
            status=400,
            mimetype='application/json'
        )
        return response

    except Exception as e:
        print(e)
        response = app.response_class(
            response=json.dumps({'approved': False, 'reason': 'Server Error'}),
            status=500,
            mimetype='application/json'
        )
        return response
    
if __name__ == '__main__':
    print("Start")
    app.run(port=3001, debug=True)
    

