


class User:

    def __init__(self, login_resp, user_data):
        # print('\n\n\n_____________________')
        # print(login_resp)
        # print('_____________________')
        # print(user_data)
        # print('_____________________\n\n\n')

        # Properties from login response
        self._local_id = login_resp['localId']
        self._id_token = login_resp['idToken']
        self._email = login_resp['email']
        self._display_name = login_resp['displayName']

        # Properties from userdata
        self._first_name = user_data['first_name']
        self._last_name = user_data['last_name']
        self._github_oauth_token = user_data['github_personal_access_token']
        self._account_type = user_data['account_type']
        

    # Properties from login response

    @property
    def local_id(self):
        """User's local id property"""
        return self._local_id
    
    @property
    def id_token(self):
        """User's id token property"""
        return self._id_token

    @property
    def email(self):
        """User's email property"""
        return self._email
    @email.setter
    def email(self, value):
        self._email = value

    @property
    def display_name(self):
        """User's display name property"""
        return self._display_name
    

    # Properties from userdata

    @property
    def first_name(self):
        """User's first name property"""
        return self._first_name
    
    @property
    def last_name(self):
        """User's last name property"""
        return self._last_name
    
    @property
    def github_oauth_token(self):
        """User's GitHub oauth token property"""
        return self._github_oauth_token
    
    @property
    def account_type(self):
        """User's account type property"""
        return self._account_type
