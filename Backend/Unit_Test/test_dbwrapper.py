import unittest
from unittest.mock import MagicMock
import sys
import os
from google.cloud.firestore_v1 import ArrayUnion
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from DbWrapper.DbWrapper import DbWrapper  

class TestDbWrapper(unittest.TestCase):

    def setUp(self):
        # Mock the Firestore client
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)  

    def test_archiveCourse(self):
        # Mock the Firestore document and its update method
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        # Call the method
        result = self.db_wrapper.archiveCourse("course123")

        # Verify that the update method was called correctly
        mock_doc.update.assert_called_once_with({"status": 1})

        # Check that the function returns True
        self.assertTrue(result)

    def test_archiveCourse_fail(self):
        # Mock the Firestore document and simulate an exception
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")

        # Call the method
        result = self.db_wrapper.archiveCourse("course123")

        # Check that the function returns False on error
        self.assertFalse(result)

    def test_getUserData(self):
        # Mock Firestore document
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"uid": "testuser", "email": "test@example.com"}
        self.mock_db.collection.return_value.document.return_value = mock_doc

        # Call the method
        result = self.db_wrapper.getUserData("testuser")

        # Verify that the document was accessed and data was returned
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"uid": "testuser", "email": "test@example.com"})

    def test_addUser(self):
        # Mock Firestore query and document creation
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []
        mock_collection = MagicMock()
        self.mock_db.collection.return_value = mock_collection

        # Call the method
        result = self.db_wrapper.addUser(1, "test@example.com", "Test", "User", "testuser", "github_token")

        # Verify that the document was created with correct data
        mock_collection.document.return_value.set.assert_called_once_with({
            "account_type": 1,
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "uid": "testuser",
            "github_personal_access_token": "github_token"
        })

        # Check that the function returns True
        self.assertTrue(result)

    def test_addUser_existing(self):
        # Simulate an existing user in the database
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [MagicMock()]

        # Call the method
        result = self.db_wrapper.addUser(1, "test@example.com", "Test", "User", "testuser")

        # Verify that the document was not created because the user already exists
        self.assertFalse(result)

    def test_getStudentCourses(self):
        # Mock Firestore stream query for courses
        mock_course_doc = MagicMock()
        mock_course_doc.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course_doc]

        # Call the method
        result = self.db_wrapper.getStudentCourses("student123")

        # Verify that the query was made and the correct data was returned
        self.assertEqual(result, [{"course_id": "course123"}])

    def test_removeCourse(self):
        # Simulate a course found in the database by returning a mock document
        mock_course = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course]

        # Call the removeCourse method
        result = self.db_wrapper.removeCourse("course123")

        # Verify that the document was deleted
        self.mock_db.collection.return_value.document.return_value.delete.assert_called_once()

        # Check that the function returns True
        self.assertTrue(result)

    def test_removeCourse_not_found(self):
        # Simulate no courses found in the database
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        # Call the method
        result = self.db_wrapper.removeCourse("course123")

        # Check that the function returns False when the course is not found
        self.assertFalse(result)

    # Additional tests from the new methods

    def test_addJoyRating(self):
        # Simulate no existing joy rating
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        # Mock document creation
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        # Call the method
        result = self.db_wrapper.addJoyRating("student123", "group123", 5, 1234567890)

        # Verify that the document was created
        mock_doc.set.assert_called_once_with({
            "student_id": "student123",
            "group_id": "group123",
            "joy_rating": 5,
            "timestamp": 1234567890
        })

        # Check that the function returns True
        self.assertTrue(result)

    def test_addJoyRating_existing(self):
        # Simulate an existing joy rating
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [MagicMock()]

        # Mock the update process
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        # Call the method (this should trigger an update)
        result = self.db_wrapper.addJoyRating("student123", "group123", 5, 1234567890)

        # Verify that the update method was called
        mock_doc.update.assert_called_once_with({"joy_rating": 5})

        # Check that the function returns True
        self.assertTrue(result)

    def test_addGroupToProject(self):
        # Mock Firestore document
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        # Call the method
        result = self.db_wrapper.addGroupToProject("group123", "proj123")

        # Verify that the update method was called correctly
        mock_doc.update.assert_called_once_with({"group_ids": ArrayUnion(["group123"])})

        # Check that the function returns True
        self.assertTrue(result)

    def test_addGroupToProject_fail(self):
        # Mock the Firestore document and simulate an exception
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")

        # Call the method
        result = self.db_wrapper.addGroupToProject("group123", "proj123")

        # Verify that the update method was called but failed
        mock_doc.update.assert_called_once_with({"group_ids": ArrayUnion(["group123"])})

        # Check that the function returns False on error
        self.assertFalse(result)

    def test_addProjectToCourse(self):
        # Mock Firestore document
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        # Call the method
        result = self.db_wrapper.addProjectToCourse("proj123", "course123")

        # Verify that the update method was called with the correct data
        mock_doc.update.assert_called_once_with({"project_ids": ArrayUnion(["proj123"])})

        # Check that the function returns True
        self.assertTrue(result)

    def test_addProjectToCourse_fail(self):
        # Mock Firestore document and simulate an exception
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")

        # Call the method
        result = self.db_wrapper.addProjectToCourse("proj123", "course123")

        # Verify that the update method was called but failed
        mock_doc.update.assert_called_once_with({"project_ids": ArrayUnion(["proj123"])})

        # Check that the function returns False on error
        self.assertFalse(result)


if __name__ == '__main__':
    unittest.main()
