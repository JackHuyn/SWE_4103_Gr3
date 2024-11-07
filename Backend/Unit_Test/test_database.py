import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from google.cloud.firestore_v1 import ArrayUnion
from DbWrapper.DbWrapper import DbWrapper

class TestDbWrapper(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)

    # 1. Test archiveCourse
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_archiveCourse(self, mock_firestore_client):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.archiveCourse("course123")
        mock_doc.update.assert_called_once_with({"status": 1})
        self.assertTrue(result)

    # 2. Test activateCourse
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_activateCourse(self, mock_firestore_client):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.activateCourse("course123")
        mock_doc.update.assert_called_once_with({"status": 0})
        self.assertTrue(result)

    # 3. Test getUserData
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getUserData(self, mock_firestore_client):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"uid": "testuser", "email": "test@example.com"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getUserData("testuser")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"uid": "testuser", "email": "test@example.com"})

    # 4. Test getCourseData
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getCourseData(self, mock_firestore_client):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getCourseData("course123")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"course_id": "course123"})

    # 5. Test getStudentCourses
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getStudentCourses(self, mock_firestore_client):
        mock_course_doc = MagicMock()
        mock_course_doc.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course_doc]
        result = self.db_wrapper.getStudentCourses("student123")
        self.assertEqual(result, [{"course_id": "course123"}])

    # 6. Test getInstructorCourses
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getInstructorCourses(self, mock_firestore_client):
        mock_course_doc = MagicMock()
        mock_course_doc.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course_doc]
        result = self.db_wrapper.getInstructorCourses("instructor123")
        self.assertEqual(result, [{"course_id": "course123"}])

    # 7. Test getProjectData
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getProjectData(self, mock_firestore_client):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"project_id": "project123"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getProjectData("project123")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"project_id": "project123"})

    # 8. Test getProjectGroups
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getProjectGroups(self, mock_firestore_client):
        mock_group_doc = MagicMock()
        mock_group_doc.to_dict.return_value = {"group_id": "group123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group_doc]
        result = self.db_wrapper.getProjectGroups("project123")
        self.assertEqual(result, [{"group_id": "group123"}])

    # 9. Test getCourseProjects
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getCourseProjects(self, mock_firestore_client):
        mock_project_doc = MagicMock()
        mock_project_doc.to_dict.return_value = {"project_id": "project123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_project_doc]
        result = self.db_wrapper.getCourseProjects("course123")
        self.assertEqual(result, [{"project_id": "project123"}])

    # 10. Test getGroupData
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getGroupData(self, mock_firestore_client):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"group_id": "group123"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getGroupData("group123")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"group_id": "group123"})

    # 11. Test getStudentGroups
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_getStudentGroups(self, mock_firestore_client):
        mock_group_doc = MagicMock()
        mock_group_doc.to_dict.return_value = {"group_id": "group123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group_doc]
        result = self.db_wrapper.getStudentGroups("student123")
        self.assertEqual(result, [{"group_id": "group123"}])

    # # 12. Test getTeamJoy
    # @patch("DbWrapper.DbWrapper.firestore.Client")
    # def test_getTeamJoy(self, mock_firestore_client):
    #     mock_joy_doc = MagicMock()
    #     mock_joy_doc.to_dict.return_value = {"joy_id": "joy123"}
    #     self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_joy_doc]
        
    #     result = self.db_wrapper.getTeamJoy("group123")
    #     self.assertEqual(result, [{"joy_id": "joy123"}])


    # 13. Test addUser
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_addUser(self, mock_firestore_client):
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []
        mock_collection = MagicMock()
        self.mock_db.collection.return_value = mock_collection
        result = self.db_wrapper.addUser(1, "test@example.com", "Test", "User", "testuser", "github_token")
        mock_collection.document.return_value.set.assert_called_once_with({
            "account_type": 1,
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "uid": "testuser",
            "github_personal_access_token": "github_token"
        })
        self.assertTrue(result)

    # 14. Test addStudentToCourse
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_addStudentToCourse(self, mock_firestore_client):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.addStudentToCourse("student123", "course123")
        mock_doc.update.assert_called_once_with({"student_ids": ArrayUnion(["student123"])})
        self.assertTrue(result)

    # 15. Test addInstructorToCourse
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_addInstructorToCourse(self, mock_firestore_client):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.addInstructorToCourse("instructor123", "course123")
        mock_doc.update.assert_called_once_with({"instructor_ids": ArrayUnion(["instructor123"])})
        self.assertTrue(result)

    # 16. Test addCourse
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_addCourse(self, mock_firestore_client):
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []
        mock_collection = MagicMock()
        self.mock_db.collection.return_value = mock_collection
        result = self.db_wrapper.addCourse("Test Course", "course123", ["instructor123"], "FR01A", "FA2024", [])
        mock_collection.document.return_value.set.assert_called_once_with({
            "course_description": "Test Course",
            "course_id": "course123",
            "instructor_ids": ["instructor123"],
            "section": "FR01A",
            "term": "FA2024",
            "status": 0,
            "student_ids": []
        })
        self.assertTrue(result)

    # 17. Test addProject
    @patch("DbWrapper.DbWrapper.firestore.Client")
    def test_addProject(self, mock_firestore_client):
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []
        mock_collection = MagicMock()
        self.mock_db.collection.return_value = mock_collection
        
        result = self.db_wrapper.addProject("course123", "proj123", "Project 1", "github.com/repo")
        
        mock_collection.document.return_value.set.assert_called_once_with({
            "course_id": "course123",
            "project_id": "proj123",
            "project_name": "Project 1",
            "github_repo_address": "github.com/repo"
        })
        
        self.assertTrue(result)

if __name__ == '__main__':
    unittest.main()

