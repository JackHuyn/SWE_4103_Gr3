import requests
import json
from  User import User as User

class InvalidInstructorKeyException(Exception):
    pass

class InvalidLogin(Exception):
    pass

class FirebaseAuth:

    def __init__(self, db, auth, api_key) -> None:
        self.db = db
        self.auth = auth
        self.api_key = api_key
        self.active_sessions = {}
        self.action_code_settings = self.auth.ActionCodeSettings(
            url='http://localhost:3000/auth/password-reset',
            handle_code_in_app=False
        )



    def sign_up_with_email_and_password(self, fname, lname, email, password):
        user = self.auth.create_user(
        email=email,
        email_verified=False,
        password=password,
        display_name=(str(fname) + ' ' + str(lname)),
        disabled=False)
        return user

    def sign_in_with_email_and_password(self, email, password, return_secure_token=True):
        payload = json.dumps({"email":email, "password":password, "return_secure_token":return_secure_token})
        rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

        r = requests.post(rest_api_url,
                    params={"key": self.api_key},
                    data=payload)
        login_resp = r.json()
        # print(login_resp)

        user_obj = User(login_resp, self.db.getUserData(login_resp['localId']))

        self.active_sessions.update({user_obj.local_id: user_obj})
        
        return user_obj
    
    def end_session(self, local_id):
        try:
            self.active_sessions.pop(local_id)
            return True
        except KeyError as ke:
            return False
    
    def user_logout(self, local_id):
        if self.end_session(local_id):
            print("LOGOUT SUCCESSFUL")
            return True
        else:
            print("LOGOUT UNSUCCESSFUL")
            return False

    def validate_token(self, local_id, id_token):
        if(local_id not in self.active_sessions):
            print("LOCAL ID NOT FOUND")
            return False
        user_session = self.active_sessions[local_id]
        if(user_session.id_token != id_token):
            print("ID TOKEN DOES NOT MATCH")
            self.end_session(local_id)
            return False
        try:
            decoded_token = self.auth.verify_id_token(id_token)
        except Exception as e:
            print("INVALID TOKEN: ", e)
            self.end_session(local_id)
            return False
        uid = decoded_token['uid']
        
        return {'status': True, 'uid': uid, 'force_password_reset': user_session.force_password_reset}
    
    def change_password(self, uid:str, new_password:str):
        return True if (self.auth.update_user(uid, password=new_password)) else False

    def forgot_password(self, email:str):
        payload = json.dumps({"email":email, "requestType": "PASSWORD_RESET"})
        rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode"

        r = requests.post(rest_api_url,
                    params={"key": self.api_key},
                    data=payload)
        reset_resp = r.json()
        print(reset_resp)
        return r.status_code == 200
    
    def validate_instructor_key(self, provided_key):
        return provided_key == 'D6B74'
    