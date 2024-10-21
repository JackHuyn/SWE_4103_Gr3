import requests
import json

class InvalidInstructorKeyException(Exception):
    pass

class FirebaseAuth:

    def __init__(self, auth, api_key) -> None:
        self.auth = auth
        self.api_key = api_key
        self.active_sessions = {}


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
        print(login_resp)

        self.active_sessions.update({login_resp['localId']: login_resp})

        return login_resp
    
    def end_session(self, local_id):
        try:
            self.active_sessions.pop(local_id)
            return True
        except KeyError as ke:
            return False

    def validate_token(self, local_id, id_token):
        if(local_id not in self.active_sessions):
            print("LOCAL ID NOT FOUND")
            return False
        user_session = self.active_sessions[local_id]
        if(user_session['idToken'] != id_token):
            print("ID TOKEN DOES NOT MATCH")
            self.end_session(local_id)
            return False
        try:
            decoded_token = self.auth.verify_id_token(id_token)
        except Exception as e:
            print("INVALID TOKEN")
            self.end_session(local_id)
            return False
        uid = decoded_token['uid']
        
        return {'status': True, 'uid':uid}
    
    def validate_instructor_key(self, provided_key):
        return provided_key == 'D6B74'
    