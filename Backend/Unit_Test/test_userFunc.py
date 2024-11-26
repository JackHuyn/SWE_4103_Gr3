import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from google.cloud.firestore_v1 import ArrayUnion
from DbWrapper.DbWrapper import DbWrapper  # Adjust the import path if necessary

class TestDbWrapperUserManagement(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)

    @patch("firebase_admin.firestore.client")
    def test_addUser(self, mock_firestore_client):
        # Simulate no existing user with the same uid
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.addUser(
            accType=1,
            email="test@example.com",
            first_name="Test",
            last_name="User",
            uid="testuser",
            github_personal_access_token="github_token"
        )
        
        # Check that the user is added with the correct data
        self.mock_db.collection.return_value.document.return_value.set.assert_called_once_with({
            "account_type": 1,
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "uid": "testuser",
            "github_personal_access_token": "github_token"
        })
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_addUser_existingUser(self, mock_firestore_client):
        # Simulate an existing user with the same uid
        mock_user = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_user]

        result = self.db_wrapper.addUser(
            accType=1,
            email="test@example.com",
            first_name="Test",
            last_name="User",
            uid="testuser",
            github_personal_access_token="github_token"
        )
        
        # Since the user exists, it should return False
        self.assertFalse(result)

    @patch("firebase_admin.firestore.client")
    def test_getUserData(self, mock_firestore_client):
        # Mock the document to return specific user data
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {
            "uid": "testuser",
            "email": "test@example.com",
            "account_type": 1
        }
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.getUserData("testuser")
        
        # Check that the retrieved data matches the mock data
        self.assertEqual(result, {"uid": "testuser", "email": "test@example.com", "account_type": 1})

    @patch("firebase_admin.firestore.client")
    def test_findUser(self, mock_firestore_client):
        # Mock the document to return specific user data
        mock_user = MagicMock()
        mock_user.to_dict.return_value = {
            "uid": "testuser",
            "email": "test@example.com",
            "account_type": 1
        }
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_user]

        result = self.db_wrapper.findUser("test@example.com")
        
        # Check that the user data is correctly retrieved by email
        self.assertEqual(result, {"uid": "testuser", "email": "test@example.com", "account_type": 1})

    @patch("firebase_admin.firestore.client")
    def test_findUser_noMatch(self, mock_firestore_client):
        # Simulate no user found with the given email
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.findUser("nonexistent@example.com")
        
        # Since no user is found, it should return None
        self.assertIsNone(result)

    @patch("firebase_admin.firestore.client")
    def test_addGithubTokenToUser(self, mock_firestore_client):
        # Mock document reference for the user
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addGithubTokenToUser("testuser", "new_github_token")
        
        # Check that the update call sets the "github_personal_access_token"
        mock_doc.update.assert_called_once_with({"github_personal_access_token": "new_github_token"})
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_updateGithubOAuthToken(self, mock_firestore_client):
        # Mock document reference for the user
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.updateGithubOAuthToken("testuser", "new_oauth_token")
        
        # Check that the update call sets the "github_personal_access_token"
        mock_doc.update.assert_called_once_with({"github_personal_access_token": "new_oauth_token"})
        self.assertTrue(result)


if __name__ == '__main__':
    unittest.main()
