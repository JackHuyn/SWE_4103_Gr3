from flask import Flask, jsonify, request
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
import requests

app = Flask(__name__)

FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'

cred = credentials.Certificate("C:/Users/willm/Documents/SWE 4103/Frontend/swe4103-7b261-firebase-adminsdk-7nzkx-030565ffc5.json")
firebase_admin.initialize_app(cred)
##db = firestore.client()

active_sessions = {}


def sign_up_with_email_and_password(fname, lname, email, password, return_secure_token=True):
    user = auth.create_user(
    email=email,
    email_verified=False,
    password=password,
    display_name=(str(fname) + ' ' + str(lname)),
    disabled=False)
    return "test"

def sign_in_with_email_and_password(email, password, return_secure_token=True):
    payload = json.dumps({"email":email, "password":password, "return_secure_token":return_secure_token})
    rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

    r = requests.post(rest_api_url,
                  params={"key": FIREBASE_WEB_API_KEY},
                  data=payload)

    return r.json()

def validate_token(local_id, id_token):
    if(local_id not in active_sessions):
        return False
    user_session = active_sessions[local_id]
    if(user_session[id_token] != id_token):
        return False
    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token['uid']
    return True


@app.route('/welcome', methods=['GET'])
def get_welcome():
    return 'Welcome!'

@app.route('/secure', methods=['GET'])
def get_secure():
    token = request.args.get("sessionId", default = -1, type = str)
    print(token)
    if(token == -1):
        print("Err")
        pass
    return 'Welcome Secure!'

@app.route('/auth/signup-with-email-and-password', methods=['POST'])
def signup_user():
    fname = request.args.get("fname", default = -1, type = str)
    lname = request.args.get("lname", default = -1, type = str)
    email = request.args.get("email", default = -1, type = str)
    password = request.args.get("password", default = -1, type = str)
    signup_resp = sign_up_with_email_and_password(fname, lname, email, password)
    print(signup_resp)
    print('Login')
    return 'signup'

@app.route('/auth/login-with-email-and-password', methods=['POST'])
def login_user():
    email = request.args.get("email", default = -1, type = str)
    password = request.args.get("password", default = -1, type = str)
    login_resp = sign_in_with_email_and_password(email, password)
    print('Email: ' + str(email))
    print('Password: ' + str(password))
    #print(login_resp)
    print('Login')
    active_sessions.update({login_resp['localId']: login_resp})
    #print(active_sessions)
    print(validate_token(login_resp['localId'], login_resp['idToken']))
    return json.dumps({'idToken': login_resp['idToken']})
    

if __name__ == '__main__':
    print("Start")
    app.run(port=3001, debug=True)
