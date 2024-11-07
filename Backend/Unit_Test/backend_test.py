import unittest
from unittest.mock import patch, MagicMock
from flask import json
from Backend import app  # Assuming your file is named `Backend.py`

class TestBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.client.testing = True

    @patch("Backend.fb_auth.FirebaseAuth")
    @patch("Backend.DbWrapper")
    def test_signup_user(self, MockDbWrapper, MockFirebaseAuth):
        # Mock FirebaseAuth and DbWrapper methods
        mock_firebase_auth = MockFirebaseAuth.return_value
        mock_db_wrapper = MockDbWrapper.return_value

        # Set up a successful mock response for sign up
        mock_firebase_auth.sign_up_with_email_and_password.return_value = MagicMock(uid="test_uid")
        mock_db_wrapper.addUser.return_value = True

        # Define the data for the request
        signup_data = {
            "fname": "Test",
            "lname": "User",
            "email": "test@example.com",
            "password": "test123",
            "accountType": 1,
            "instructorKey": "valid_key"
        }

        # Send POST request
        response = self.client.post('/auth/signup-with-email-and-password', query_string=signup_data)
        data = json.loads(response.data)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertIn('approved', data)
        self.assertTrue(data['approved'])

    @patch("Backend.fb_auth.FirebaseAuth")
    def test_login_user(self, MockFirebaseAuth):
        mock_firebase_auth = MockFirebaseAuth.return_value
        mock_firebase_auth.sign_in_with_email_and_password.return_value = {
            "localId": "test_local_id",
            "idToken": "test_id_token"
        }

        login_data = {
            "email": "test@example.com",
            "password": "test123"
        }

        response = self.client.get('/auth/login-with-email-and-password', query_string=login_data)
        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertIn('approved', data)
        self.assertTrue(data['approved'])

    @patch("Backend.DbWrapper")
    def test_add_course(self, MockDbWrapper):
        mock_db_wrapper = MockDbWrapper.return_value
        mock_db_wrapper.addCourse.return_value = True

        add_course_data = {
            "course_name": "Course 101",
            "course_description": "Introductory Course",
            "course_term": "Fall",
            "course_section": "A",
            "instructor_ids": ["instr_123"]
        }

        response = self.client.post('/add-course', json=add_course_data)
        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertIn('approved', data)
        self.assertTrue(data['approved'])

    @patch("Backend.DbWrapper")
    def test_remove_course(self, MockDbWrapper):
        mock_db_wrapper = MockDbWrapper.return_value
        mock_db_wrapper.removeCourse.return_value = True

        remove_course_data = {"course_name": "Course 101"}

        response = self.client.post('/remove-course', json=remove_course_data)
        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertIn('approved', data)
        self.assertTrue(data['approved'])

    @patch("Backend.DbWrapper")
    def test_get_course_data(self, MockDbWrapper):
        mock_db_wrapper = MockDbWrapper.return_value
        mock_db_wrapper.getCourseData.return_value = {"course_id": "course123", "course_name": "Course 123"}

        response = self.client.get('/auth/course_home_page', query_string={"courseId": "course123"})
        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertIn('approved', data)
        self.assertTrue(data['approved'])
        self.assertIn('courses', data)

    @patch("Backend.DbWrapper")
    def test_show_courses(self, MockDbWrapper):
        mock_db_wrapper = MockDbWrapper.return_value
        mock_db_wrapper.getInstructorCourses.return_value = [{"course_id": "course123"}]
        mock_db_wrapper.getStudentCourses.return_value = [{"course_id": "course456"}]

        # Mock role function for instructor
        with patch("Backend.getUserRole", return_value=1):
            response = self.client.get('/auth/courses', query_string={"localId": "instructor_id"})
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertIn('approved', data)
            self.assertTrue(data['approved'])

        # Mock role function for student
        with patch("Backend.getUserRole", return_value=0):
            response = self.client.get('/auth/courses', query_string={"localId": "student_id"})
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertIn('approved', data)
            self.assertTrue(data['approved'])

if __name__ == '__main__':
    unittest.main()
