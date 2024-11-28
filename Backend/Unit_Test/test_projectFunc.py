import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from DbWrapper.DbWrapper import DbWrapper  # Adjust the import path if necessary

class TestDbWrapperProjectManagement(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)

    @patch("firebase_admin.firestore.client")
    def test_addProject(self, mock_firestore_client):
        # Simulate no existing project with the same project_id
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []
        
        result = self.db_wrapper.addProject(
            course_id="course123",
            project_id="proj123",
            project_name="Project 1",
            github_repo_address="https://github.com/repo"
        )
        
        # Check that the project is added with the correct data
        self.mock_db.collection.return_value.document.return_value.set.assert_called_once_with({
            "course_id": "course123",
            "project_id": "proj123",
            "project_name": "Project 1",
            "github_repo_address": "https://github.com/repo"
        })
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addProject_existingProject(self, mock_firestore_client):
        # Simulate an existing project with the same project_id
        mock_project = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_project]

        result = self.db_wrapper.addProject(
            course_id="course123",
            project_id="proj123",
            project_name="Project 1",
            github_repo_address="https://github.com/repo"
        )
        
        # Since the project exists, it should return False
        self.assertFalse(result)

    @patch("firebase_admin.firestore.client")
    def test_getProjectData(self, mock_firestore_client):
        # Mock the document to return specific project data
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {
            "project_id": "proj123",
            "course_id": "course123",
            "project_name": "Project 1"
        }
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.getProjectData("proj123")
        
        # Check that the retrieved data matches the mock data
        self.assertEqual(result, {
            "project_id": "proj123",
            "course_id": "course123",
            "project_name": "Project 1"
        })

    @patch("firebase_admin.firestore.client")
    def test_getCourseProjects(self, mock_firestore_client):
        # Mock documents to return multiple projects under the same course
        mock_project1 = MagicMock()
        mock_project1.to_dict.return_value = {
            "project_id": "proj123",
            "course_id": "course123",
            "project_name": "Project 1"
        }
        mock_project2 = MagicMock()
        mock_project2.to_dict.return_value = {
            "project_id": "proj456",
            "course_id": "course123",
            "project_name": "Project 2"
        }
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_project1, mock_project2]

        result = self.db_wrapper.getCourseProjects("course123")
        
        # Check that the list of projects matches the mock data
        self.assertEqual(result, [
            {"project_id": "proj123", "course_id": "course123", "project_name": "Project 1"},
            {"project_id": "proj456", "course_id": "course123", "project_name": "Project 2"}
        ])


    @patch("firebase_admin.firestore.client")
    def test_getProjectGroups(self, mock_firestore_client):
        # Mock documents to return multiple groups under the same project
        mock_group1 = MagicMock()
        mock_group1.to_dict.return_value = {
            "group_id": "group123",
            "project_id": "proj123",
            "student_ids": ["student1", "student2"]
        }
        mock_group2 = MagicMock()
        mock_group2.to_dict.return_value = {
            "group_id": "group456",
            "project_id": "proj123",
            "student_ids": ["student3", "student4"]
        }
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group1, mock_group2]

        result = self.db_wrapper.getProjectGroups("proj123")
        
        # Check that the list of groups matches the mock data
        self.assertEqual(result, [
            {"group_id": "group123", "project_id": "proj123", "student_ids": ["student1", "student2"]},
            {"group_id": "group456", "project_id": "proj123", "student_ids": ["student3", "student4"]}
        ])


if __name__ == '__main__':
    unittest.main()
