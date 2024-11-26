import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from google.cloud.firestore_v1 import ArrayUnion
from DbWrapper.DbWrapper import DbWrapper  


class TestDbWrapperCourseManagement(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)

    @patch("firebase_admin.firestore.client")
    def test_addCourse(self, mock_firestore_client):
        # Mock that there are no existing courses with the same course_id
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.addCourse("Test Course", "course123", ["instructor123"], "FR01A", "FA2024")
        
        # Assert that the course is added with the expected fields
        self.mock_db.collection.return_value.document.return_value.set.assert_called_once_with({
            "course_description": "Test Course",
            "course_id": "course123",
            "instructor_ids": ["instructor123"],
            "section": "FR01A",
            "term": "FA2024",
            "status": 0,
            "student_ids": []
        })
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_getCourseData(self, mock_firestore_client):
        # Mock the course document data
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"course_id": "course123", "course_description": "Test Course"}
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.getCourseData("course123")
        
        # Assert that the retrieved course data matches the mock
        self.assertEqual(result, {"course_id": "course123", "course_description": "Test Course"})

    @patch("firebase_admin.firestore.client")
    def test_getStudentCourses(self, mock_firestore_client):
        # Mock a course document in the student's enrolled courses
        mock_course = MagicMock()
        mock_course.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course]

        result = self.db_wrapper.getStudentCourses("student123")
        
        # Assert that the student's courses match the mocked data
        self.assertEqual(result, [{"course_id": "course123"}])

    @patch("firebase_admin.firestore.client")
    def test_getInstructorCourses(self, mock_firestore_client):
        # Mock a course document in the instructor's assigned courses
        mock_course = MagicMock()
        mock_course.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course]

        result = self.db_wrapper.getInstructorCourses("instructor123")
        
        # Assert that the instructor's courses match the mocked data
        self.assertEqual(result, [{"course_id": "course123"}])

    @patch("firebase_admin.firestore.client")
    def test_archiveCourse(self, mock_firestore_client):
        # Mock document reference for the course
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.archiveCourse("course123")
        
        # Check that the update call sets "status" to 1 (archived)
        mock_doc.update.assert_called_once_with({"status": 1})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_activateCourse(self, mock_firestore_client):
        # Mock document reference for the course
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.activateCourse("course123")
        
        # Check that the update call sets "status" to 0 (active)
        mock_doc.update.assert_called_once_with({"status": 0})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addStudentToCourse(self, mock_firestore_client):
        # Mock document reference for the course
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addStudentToCourse("student123", "course123")
        
        # Check that the update call adds student_id using ArrayUnion
        mock_doc.update.assert_called_once_with({"student_ids": ArrayUnion(["student123"])})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addInstructorToCourse(self, mock_firestore_client):
        # Mock document reference for the course
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addInstructorToCourse("instructor123", "course123")
        
        # Check that the update call adds instructor_id using ArrayUnion
        mock_doc.update.assert_called_once_with({"instructor_ids": ArrayUnion(["instructor123"])})
        self.assertTrue(result)


if __name__ == '__main__':
    unittest.main()
