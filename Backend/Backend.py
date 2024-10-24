from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import FileUpload as fp
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
import requests
import Auth as fb_auth
import os 
from DbWrapper.DbWrapper import DbWrapper

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'
credFileName = "swe4103-7b261-firebase-adminsdk.json"

dir_path = os.path.dirname(os.path.realpath(__file__))
cred = credentials.Certificate(os.path.join(dir_path, credFileName))
firebase_admin.initialize_app(cred)
db = firestore.client()

dbWrapper = DbWrapper(db)

firebase_auth = fb_auth.FirebaseAuth(auth, FIREBASE_WEB_API_KEY)


@app.route('/', methods=['GET'])
@cross_origin()
def get_home():
    return 'Welcome!'

@app.route('/welcome', methods=['GET'])
@cross_origin()
def get_welcome():
    return get_home()

@app.route('/secure', methods=['GET'])
@cross_origin()
def get_secure():
    token = request.args.get("sessionId", default = -1, type = str)
    print(token)
    if(token == -1):
        print("Err")
        pass
    return 'Welcome Secure!'

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
        login_resp = firebase_auth.sign_in_with_email_and_password(email, password)
        response = app.response_class(
            response=json.dumps({'approved': True, 'localId': login_resp['localId'], 'idToken': login_resp['idToken']}),
            status=200,
            mimetype='application/json'
        )
        response.set_cookie('idToken', login_resp['idToken'], httponly=True, secure=True, samesite='Strict', path='/')
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
    response = app.response_class(
        response=json.dumps({'approved': firebase_auth.validate_token(local_id, id_token)}),
        status=200,
        mimetype='application/json'
    )
    print(response.response)
    return response

@app.route('/auth/logout', methods=['POST'])
@cross_origin()
def logout_user():
    local_id = request.args.get("localId", default = -1, type = str)
    firebase_auth.end_session(local_id)
    response = app.response_class(
        response=json.dumps({}),
        status=200,
        mimetype='application/json'
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
        print(list_of_emails)
        users_not_found = []

        #Send emails to backend and retrieve their student id's
        for email in list_of_emails:
            user_dict = dbWrapper.findUser(email)
            if user_dict != None:
                user_id = user_dict['uid']
                if dbWrapper.addStudentToCourse(user_id, course_id): #add students to cs1073 for now
                    print(user_id + ':\tDone')
                else:
                    print(user_id + ':\tFail')
            else:
                # add not found emails to a not found list
                users_not_found.append(email)

        print('No accounts were found for the following email addresses: ', users_not_found)


        
        
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
        print(course_data)

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

    
#Author: Sarun Weerakul
#print student email from course list
@app.route('/auth/student_list_in_courses', methods= ['GET','POST'])
@cross_origin()
def student_List():
    local_id = request.args.get("localId", default = -1, type = str)
    print('course ID is : ', local_id)
    if local_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'Invalid course ID'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    try:  
        students = getStudentList(local_id)
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
                    'courses': students
                }),
                status=200,
                mimetype='application/json'
            )
            return response      
        elif students == []:
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
    
if __name__ == '__main__':
    print("Start")
    app.run(port=3001, debug=True)
    

