# import unittest
# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from unittest.mock import patch, MagicMock
# from flask import json
# from Backend import app  # Adjust the import path if necessary

# class TestFlaskApp(unittest.TestCase):

#     def setUp(self):
#         # Set up the Flask test client
#         self.app = app.test_client()
#         self.app.testing = True

#     @patch("firebase_admin.auth")  # Patch the Firebase Auth
#     @patch("firebase_admin.firestore")  # Patch Firestore
#     def test_signup_user(self, mock_firestore, mock_auth):
#         # Mock Firebase Auth responses
#         mock_auth.create_user.return_value = MagicMock(uid="mock_uid")
#         mock_auth.verify_id_token.return_value = {"uid": "mock_uid"}
        
#         # Mock Firestore interactions
#         mock_firestore.client.return_value.collection.return_value.document.return_value.set = MagicMock()

#         signup_data = {
#             "fname": "Test",
#             "lname": "Account",
#             "email": "test@unb.ca",
#             "password": "test123",
#             "accountType": 1,
#             "instructorKey": "D6B74"
#         }

#         # Send a POST request to the signup route
#         response = self.app.post('/auth/signup-with-email-and-password', query_string=signup_data)

#         # Verify response
#         self.assertEqual(response.status_code, 200)
#         response_data = json.loads(response.data)
#         self.assertIn('approved', response_data)
#         self.assertTrue(response_data['approved'])

#     @patch("firebase_admin.auth")  # Patch the Firebase Auth
#     def test_signup_user_invalid_instructor_key(self, mock_auth):
#         # Mock the instructor key validation to return False
#         mock_auth.verify_id_token.return_value = None  # Simulate invalid token

#         signup_data = {
#             "fname": "Test",
#             "lname": "Account",
#             "email": "test11111@unb.ca",
#             "password": "test123",
#             "accountType": 1,
#             "instructorKey": "invalid_key"
#         }

#         response = self.app.post('/auth/signup-with-email-and-password', query_string=signup_data)

#         # Verify response for invalid instructor key
#         self.assertEqual(response.status_code, 401)
#         response_data = json.loads(response.data)
#         self.assertIn('approved', response_data)
#         self.assertFalse(response_data['approved'])
#         self.assertEqual(response_data['reason'], 'Instructor Key Error')

#     @patch("firebase_admin.auth")  # Patch the Firebase Auth
#     def test_login_user(self, mock_auth):
#         # Mock sign_in_with_email_and_password method
#         mock_auth.sign_in_with_email_and_password.return_value = {
#             "localId": "mock_local_id",
#             "idToken": "mock_id_token"
#         }

#         login_data = {
#             "email": "test@unb.ca",
#             "password": "test123"
#         }

#         response = self.app.get('/auth/login-with-email-and-password', query_string=login_data)

#         # Verify successful login response
#         self.assertEqual(response.status_code, 200)
#         response_data = json.loads(response.data)
#         self.assertIn('approved', response_data)
#         self.assertTrue(response_data['approved'])

#     @patch("firebase_admin.firestore")  # Patch Firestore
#     def test_get_course_data(self, mock_firestore):
#         # Mock Firestore to return course data
#         mock_firestore.client.return_value.collection.return_value.document.return_value.get.return_value.to_dict.return_value = {
#             "course_id": "ECE2711",
#             "course_name": "Engineering Fundamentals",
#             "students": ["student1", "student2"]
#         }

#         course_data_params = {
#             "localId": "mock_local_id",
#             "courseId": "ECE2711"
#         }

#         response = self.app.get('/auth/course_home_page', query_string=course_data_params)

#         # Verify course data retrieval response
#         self.assertEqual(response.status_code, 200)
#         response_data = json.loads(response.data)
#         self.assertIn('approved', response_data)
#         self.assertTrue(response_data['approved'])
#         self.assertIn('courses', response_data)

#     # Additional test cases for other routes...

# if __name__ == "__main__":
#     unittest.main()
