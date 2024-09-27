from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
import requests

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

FIREBASE_WEB_API_KEY = 'AIzaSyD-f3Vq6kGVXcfjnMmXFuoP1T1mRx7VJXo'

cred = credentials.Certificate("C:/Users/willm/Documents/GitHub/SWE_4103_Gr3/swe4103-7b261-firebase-adminsdk-7nzkx-e88172454d.json")
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
    return user

def sign_in_with_email_and_password(email, password, return_secure_token=True):
    payload = json.dumps({"email":email, "password":password, "return_secure_token":return_secure_token})
    rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

    r = requests.post(rest_api_url,
                  params={"key": FIREBASE_WEB_API_KEY},
                  data=payload)

    return r.json()

def validate_token(local_id, id_token):
    if(local_id not in active_sessions):
        print("LOCAL ID NOT FOUND")
        return False
    user_session = active_sessions[local_id]
    if(user_session['idToken'] != id_token):
        print("ID TOKEN DOES NOT MATCH")
        end_session(local_id)
        return False
    try:
        decoded_token = auth.verify_id_token(id_token)
    except Exception as e:
        print("INVALID TOKEN")
        end_session(local_id)
        return False
    uid = decoded_token['uid']
    return True

def end_session(local_id):
    try:
        active_sessions.pop(local_id)
        return True
    except KeyError as ke:
        return False


@app.route('/welcome', methods=['GET'])
@cross_origin()
def get_welcome():
    return 'Welcome!'

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
    signup_resp = sign_up_with_email_and_password(fname, lname, email, password)
    print(signup_resp)
    print('Login')
    return 'signup'

@app.route('/auth/login-with-email-and-password', methods=['GET'])
@cross_origin()
def login_user():
    email = request.args.get("email", default = -1, type = str)
    password = request.args.get("password", default = -1, type = str)
    login_resp = sign_in_with_email_and_password(email, password)
    print('Login')
    active_sessions.update({login_resp['localId']: login_resp})
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
        response=json.dumps({'approved': validate_token(local_id, id_token)}),
        status=200,
        mimetype='application/json'
    )
    print(response.response)
    return response

@app.route('/auth/logout', methods=['POST'])
@cross_origin()
def logout_user():
    local_id = request.args.get("localId", default = -1, type = str)
    print('Num Active Sessions Before: ' + str(len(active_sessions)))
    end_session(local_id)
    print('Num Active Sessions After: ' + str(len(active_sessions)))
    response = app.response_class(
        response=json.dumps({}),
        status=200,
        mimetype='application/json'
    )
    return response
    

if __name__ == '__main__':
    print("Start")
    app.run(port=3001, debug=True)
