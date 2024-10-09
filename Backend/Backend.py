from flask import Flask, jsonify, request, render_template, redirect, url_for
from flask_cors import CORS, cross_origin
import file_upload as fp
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
import requests
import Auth as fb_auth
import os 


# app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'

# FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'
# credFileName = "swe4103-7b261-firebase-adminsdk.json"

# dir_path = os.path.dirname(os.path.realpath(__file__))
# #cred = credentials.Certificate(dir_path + "\\" + credFileName)
# firebase_admin.initialize_app(cred)
##db = firestore.client()



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

firebase_auth = fb_auth.FirebaseAuth(auth, FIREBASE_WEB_API_KEY)

@app.route('/', methods=['GET'])
@cross_origin()
def get_home():
    return 'Welcome!'

@app.route('/welcome', methods=['GET'])
@cross_origin()
def get_welcome():
    return get_home()

@app.route('/auth/signup-with-email-and-password', methods=['POST'])
@cross_origin()
def signup_user():
    print('sign up user')
    fname = request.args.get("fname", default = "", type = str)
    lname = request.args.get("lname", default = "", type = str)
    email = request.args.get("email", default = "", type = str)
    password = request.args.get("password", default = "", type = str)
    account_type = request.args.get("accountType", default = 1, type = int)
    instructor_key = request.args.get("instructorKey", default = "", type = str)
    try:
        if(account_type == 1 and not firebase_auth.validate_instructor_key(instructor_key)):
            raise fb_auth.InvalidInstructorKeyException
        print('before firebase sign up')
        signup_resp = firebase_auth.sign_up_with_email_and_password(fname, lname, email, password)
        print('here')
        print(signup_resp)
        response = app.response_class(
            response=json.dumps({'approved': True}),
            status=(200),
            mimetype='application/json'
        )
        return response
    except fb_auth.InvalidInstructorKeyException as iike:
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
    print(response.response)
    return response

@app.route('/auth/validate-session', methods=['GET'])
@cross_origin()
def validate_session():
    local_id = request.args.get("localId", default = -1, type = str)
    id_token = request.args.get("idToken", default = -1, type = str)
    valid = firebase_auth.validate_token(local_id, id_token)
    response = app.response_class(
        response=json.dumps({'approved': valid}),
        status=(200 if valid else 401),
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


'''ALLOWED_EXTENSIONS = set(['csv'])

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    file.save(os.path.join('Uploads',file.filename))'''
    


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
       # return render_template('upload.html') 
    
    else:
        file = request.files['file']
        #would need to confirm that I am logged in using validate_session or firebase_auth.validate_token ? 
        #valid = True
        response = app.response_class(
            response=json.dumps({'approved': True }),
            status = 200, 
            mimetype = 'application/json'

        )

    #need to revisit what the following code snippet should do
    if file.filename == '':
        response = app.response_class(
            response = json.dumps({'approved': False}),
            status=401,
            mimetype='application/json'
        )

        return response
        #return render_template('upload.html') 

    if file and fp.allowed_file(file.filename):
        fp.save_file(file)
        response = app.response_class(
            response = json.dumps({'approved': True}),
            status = 200,
            mimetype = 'application/json'
        )
        return response
    #return render_template('upload.html') 

    
    


    
    

if __name__ == '__main__':
    print("Start")
    app.run(port=3001, debug=True)
