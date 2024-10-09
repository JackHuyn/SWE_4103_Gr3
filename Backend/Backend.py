from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
import requests
import Auth as fb_auth
import os 
from DbWrapper.DbWrapper import DbWrapper



# Get the directory where the current script is located
script_directory = os.path.dirname(os.path.abspath(__file__))
# Get the full path to the file
file_name = "swe4103-7b261-firebase-adminsdk.json"
file_path = os.path.join(script_directory, file_name)

app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'
FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'

cred = credentials.Certificate(file_path)
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
    fname = request.args.get("fname", default = -1, type = str)
    lname = request.args.get("lname", default = -1, type = str)
    email = request.args.get("email", default = -1, type = str)
    password = request.args.get("password", default = -1, type = str)
    signup_resp = firebase_auth.sign_up_with_email_and_password(fname, lname, email, password)
    print(signup_resp)
    print('Login')
    return 'signup'

@app.route('/auth/login-with-email-and-password', methods=['GET'])
@cross_origin()
def login_user():
    email = request.args.get("email", default = -1, type = str)
    password = request.args.get("password", default = -1, type = str)
    login_resp = firebase_auth.sign_in_with_email_and_password(email, password)
    response = app.response_class(
        response=json.dumps({'localId': login_resp['localId'], 'idToken': login_resp['idToken']}),
        status=200,
        mimetype='application/json'
    )
    print(response.response)
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

# Jack Huynh _ Show courses
@app.route('/students/courses', methods= ["GET"])
@cross_origin()
def show_courses():
    # get student id from the current login
    # student_id = request.args.get("studentId", default = -1, type = int)
    student_id = 3713652
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
        # Add courses to test
        print("Adding courses for student:", student_id)
        dbWrapper.addStudentToCourse("3713652", "TestCourse")
        dbWrapper.addStudentToCourse("3713652", "TestCourse2")
        dbWrapper.addStudentToCourse("3713652", "TestCourse3")
        dbWrapper.addStudentToCourse("3713652", "TestCourse4")

        # Fetch student courses
        print("Fetching courses for student:", student_id)
        student_data = dbWrapper.getStudentCourses(student_id)

        # Debug output
        print("Student data retrieved:", student_data)
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
