import unittest
from app import app  # import the Flask app from your app module
import json

class TestFlaskApp(unittest.TestCase):

    # Setup method to initialize the test client before each test
    def setUp(self):
        self.app = app.test_client()  # create the Flask test client
        self.app.testing = True  # enables exceptions to be propagated

    # Test case for the signup_user endpoint
    def test_signup_user(self):
        # Mock request arguments
        signup_data = {
            "fname": "John",
            "lname": "Doe",
            "email": "johndoe@example.com",
            "password": "password123",
            "accountType": 1,
            "instructorKey": "valid_key"
        }
        
        # Send a POST request to the /auth/signup-with-email-and-password route
        response = self.app.post('/auth/signup-with-email-and-password', query_string=signup_data)
        
        # Check the status code of the response
        self.assertEqual(response.status_code, 200)
        
        # Convert the response data from JSON
        response_data = json.loads(response.data)
        
        # Check that the response has the expected structure
        self.assertIn('approved', response_data)
        self.assertTrue(response_data['approved'])

    # Test case for invalid instructor key scenario
    def test_signup_user_invalid_instructor_key(self):
        signup_data = {
            "fname": "John",
            "lname": "Doe",
            "email": "johndoe@example.com",
            "password": "password123",
            "accountType": 1,
            "instructorKey": "invalid_key"
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
            "email": "johndoe@example.com",
            "password": "password123"
        }
        
        response = self.app.get('/auth/login-with-email-and-password', query_string=login_data)
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.data)
        self.assertIn('approved', response_data)
        self.assertTrue(response_data['approved'])
    
    # More test cases for other routes can go here...

# Run the tests
if __name__ == '__main__':
    unittest.main()
