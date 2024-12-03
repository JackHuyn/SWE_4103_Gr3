import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from google.cloud.firestore_v1 import ArrayUnion
from DbWrapper.DbWrapper import DbWrapper  
import datetime

class TestDbWrapperGroupManagement(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)

    @patch("firebase_admin.firestore.client")
    def test_addGroup(self, mock_firestore_client):
        # Simulate no existing group with the same group_id
        self.db_wrapper.getProjectGroups = MagicMock(return_value=[])  # No existing groups
        self.db_wrapper.getProjectData = MagicMock(return_value={"project_name": "Project 1"})

        result = self.db_wrapper.addGroup(
            project_id="proj123",
            student_ids=["student1", "student2"],
            github_repo_address="https://github.com/repo",
            scrum_master=["student1"]
        )

        # Check that the group is added with the correct data
        group_id = "proj123_gr1"  # Expected group ID
        self.mock_db.collection.return_value.document.return_value.set.assert_called_once_with({
            "group_id": group_id,
            "group_name": "Project 1 Group 1",
            "project_id": "proj123",
            "student_ids": ["student1", "student2"],
            "avg_joy": {datetime.datetime.today().strftime("%d/%m/%Y"): 'None'},
            "github_repo_address": "https://github.com/repo",
            "scrum_master": ["student1"],
            "show_survey": 0
        })
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addGroup_existingGroup(self, mock_firestore_client):
        # Simulate existing groups under the same project
        self.db_wrapper.getProjectGroups = MagicMock(return_value=[{"group_id": "proj123_gr1"}])
        self.db_wrapper.getProjectData = MagicMock(return_value={"project_name": "Project 1"})

        result = self.db_wrapper.addGroup(
            project_id="proj123",
            student_ids=["student1", "student2"],
            github_repo_address="https://github.com/repo",
            scrum_master=["student1"]
        )

        # Since the group ID already exists, it should create a new group ID
        group_id = "proj123_gr2"  # Expected group ID for the second group
        self.mock_db.collection.return_value.document.return_value.set.assert_called_once_with({
            "group_id": group_id,
            "group_name": "Project 1 Group 2",
            "project_id": "proj123",
            "student_ids": ["student1", "student2"],
            "avg_joy": {datetime.datetime.today().strftime("%d/%m/%Y"): 'None'},
            "github_repo_address": "https://github.com/repo",
            "scrum_master": ["student1"],
            "show_survey": 0
        })
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_getGroupData(self, mock_firestore_client):
        # Mock document to return specific group data
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {
            "group_id": "group123",
            "project_id": "proj123",
            "student_ids": ["student1", "student2"]
        }
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.getGroupData("group123")

        # Check that the retrieved data matches the mock data
        self.assertEqual(result, {
            "group_id": "group123",
            "project_id": "proj123",
            "student_ids": ["student1", "student2"]
        })

    @patch("firebase_admin.firestore.client")
    def test_getStudentGroups(self, mock_firestore_client):
        # Mock documents to return groups that include the specified student
        mock_group1 = MagicMock()
        mock_group1.to_dict.return_value = {
            "group_id": "group123",
            "student_ids": ["student1", "student2"]
        }
        mock_group2 = MagicMock()
        mock_group2.to_dict.return_value = {
            "group_id": "group456",
            "student_ids": ["student1", "student3"]
        }
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group1, mock_group2]

        result = self.db_wrapper.getStudentGroups("student1")

        # Check that the list of groups matches the mock data
        self.assertEqual(result, [
            {"group_id": "group123", "student_ids": ["student1", "student2"]},
            {"group_id": "group456", "student_ids": ["student1", "student3"]}
        ])

    @patch("firebase_admin.firestore.client")
    def test_addStudentToGroup(self, mock_firestore_client):
        # Simulate adding a student to a group
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addStudentToGroup("group123", "student1")

        # Check that the student is added to the group
        mock_doc.update.assert_called_once_with({"student_ids": ArrayUnion(["student1"])})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addScrumMasterToGroup(self, mock_firestore_client):
        # Simulate adding a scrum master to a group
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        scrum_master = ["student1"]  # The scrum master to be added
        result = self.db_wrapper.addScrumMasterToGroup("group123", scrum_master=scrum_master)

        # Check that the scrum master is added to the group using ArrayUnion
        mock_doc.update.assert_called_once_with({"scrum_master": ArrayUnion([scrum_master])})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addGithubRepoToGroup(self, mock_firestore_client):
        # Simulate adding a GitHub repository to a group
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addGithubRepoToGroup("group123", github_repo_address="https://github.com/repo")

        # Check that the GitHub repo address is added to the group
        mock_doc.update.assert_called_once_with({"github_repo_address": "https://github.com/repo"})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_removeGroup(self, mock_firestore_client):
        # Simulate an existing group with the group_id
        mock_group = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group]

        result = self.db_wrapper.removeGroup("group123")

        # Check that the group is deleted
        self.mock_db.collection.return_value.document("group123").delete.assert_any_call()
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_removeGroup_noGroup(self, mock_firestore_client):
        # Simulate no group with the given group_id
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.removeGroup("group123")

        # Since the group doesn't exist, it should return False
        self.assertFalse(result)

if __name__ == '__main__':
    unittest.main()
