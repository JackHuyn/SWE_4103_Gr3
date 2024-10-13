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
        print(login_resp)
        response = app.response_class(
            response=json.dumps({'approved': True, 'localId': login_resp['localId'], 'idToken': login_resp['idToken']}),
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
       
    
    else:
        file = request.files['file']
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
        fp.save_file(file)
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
        data = request.args

      
        
        # Extract the fields from the JSON object
        course_name = data.get("courseName", "")
        course_description = data.get("courseDescription", "")
        course_term = data.get("courseTerm", "")
        course_section = data.get("courseSection", "")
        instructor_ids = data.get("instructor_ids", [])

        print(course_name)
        print(course_description)
        print(course_term)
        print(course_section)

        # Check if all required fields are provided
        if not (course_name and course_description and course_term and course_section):
            raise ValueError("Missing required fields")

        # Call the `addCourse` function from `DbWrapper`
        success = dbWrapper.addCourse(
            course_description=course_description,
            course_id=course_name,
            instructor_ids=[],
            section=course_section,
            term=course_term,
            project_ids=[],
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

    


# Jack Huynh _ Show courses
@app.route('/auth/students/courses', methods= ["GET"])
@cross_origin()
def show_courses():
    # get student id from the current login
    # student_id = request.args.get("studentId", default = -1, type = int)
    student_id = "3708644"
    # handle wrong student id case
    if student_id == -1:
        response = app.response_class(
            response=json.dumps({'error': 'No/wrong id'}),
            status = 401,
            mimetype='applicaion/json'
        )
        return response
    try:  
        # get student data
        # Fetch student courses
        student_data = dbWrapper.getStudentCourses(student_id)

        response = app.response_class(
            response=json.dumps({'approved': True, 'id': 'valid'}),
            status = 200,
            mimetype='applicaion/json'
        )

        # if data exist?
        if student_data:
            # Convert dictionary to JSON for frontend use
            print("converting")
            response = app.response_class(
                response=json.dumps({
                    'approved': True,
                    'courses': student_data
                }),
                status=200,
                mimetype='application/json'
            )
            return response
        else:
            # handle no data exist
            print("no data")
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
