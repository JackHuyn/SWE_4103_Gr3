import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from Backend import app
import json

class TestFlaskApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client() 
        self.app.testing = True  

    # Test case for the signup_user endpoint
    def test_signup_user(self):
        # Mock request arguments
        signup_data = {
            "fname": "Test",
            "lname": "Account",
            "email": "test11111@unb.ca",
            "password": "test123",
            "accountType": 1,
            "instructorKey": "D6B74"
        }
        

        response = self.app.post('/auth/signup-with-email-and-password', query_string=signup_data)
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        
        self.assertIn('approved', response_data)
        self.assertTrue(response_data['approved'])

    # Test case for invalid instructor key scenario
    def test_signup_user_invalid_instructor_key(self):
        signup_data = {
            "fname": "Test",
            "lname": "Account",
            "email": "test@unb.ca",
            "password": "test123",
            "accountType": 1,
            "instructorKey": "valid_key"
        }
        
        response = self.app.post('/auth/signup-with-email-and-password', query_string=signup_data)
        self.assertEqual(response.status_code, 401)

        response_data = json.loads(response.data)
        self.assertIn('approved', response_data)
        self.assertFalse(response_data['approved'])
        self.assertEqual(response_data['reason'], 'Instructor Key Error')

    # Test case for login_user endpoint
    def test_login_user(self):
        login_data = {
            "email": "test@unb.ca",
            "password": "test123"
        }
        
        response = self.app.get('/auth/login-with-email-and-password', query_string=login_data)
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.data)
        self.assertIn('approved', response_data)
        self.assertTrue(response_data['approved'])
    
if __name__ == '__main__':
    unittest.main()
