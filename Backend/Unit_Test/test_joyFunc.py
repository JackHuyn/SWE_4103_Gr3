import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from datetime import datetime
from DbWrapper.DbWrapper import DbWrapper  
from firebase_admin import firestore  # Importing to reference firestore.SERVER_TIMESTAMP
import datetime
import pytz

class TestDbWrapperJoyManagement(unittest.TestCase):

    def setUp(self):
        self.mock_db = MagicMock()
        self.db_wrapper = DbWrapper(self.mock_db)

    ### JOY MANAGEMENT TESTS ###

    @patch("firebase_admin.firestore.client")
    def test_addJoyRating(self, mock_firestore_client):
        self.db_wrapper.updateJoyRating = MagicMock(return_value=False)  # Ensure updateJoyRating does not override
        self.db_wrapper.calculateJoyAverage = MagicMock(return_value=True)

        result = self.db_wrapper.addJoyRating("student1", "group123", 4, "Feeling great")

        # Set the expected document data with SERVER_TIMESTAMP as the sentinel value
        timestamp = int(datetime.datetime.now().timestamp())
        doc_id = f"student1_group123_{timestamp}"
        expected_data = {
            "student_id": "student1",
            "group_id": "group123",
            "joy_rating": 4,
            "comment": "Feeling great",
            "timestamp": firestore.SERVER_TIMESTAMP  # Explicitly setting this as Sentinel value
        }
        
        # Ensure the set call matches the expected data structure
        self.mock_db.collection().document(doc_id).set.assert_called_once_with(expected_data)
        self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_updateJoyRating(self, mock_firestore_client):
        timestamp = int(datetime.datetime.now().timestamp())
        doc_id = f"student1_group123_{timestamp}"
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.updateJoyRating("student1", "group123", 5, "Feeling even better")

        # Verify that the joy rating and comment were updated
        mock_doc.update.assert_any_call({"joy_rating": 5})
        mock_doc.update.assert_any_call({"comment": "Feeling even better"})
        self.assertTrue(result)

    # @patch("firebase_admin.firestore.client")
    # def test_calculateJoyAverage(self, mock_firestore_client):
    #     # Define the group_id and test date
    #     group_id = "group123"
    #     test_date = datetime.datetime(2024, 11, 7)
    #     timezone = pytz.timezone('Etc/GMT+3')
        
    #     # Mock joy documents with joy ratings for the same group and day
    #     mock_joy1 = MagicMock()
    #     mock_joy1.to_dict.return_value = {"joy_rating": 3}
    #     mock_joy2 = MagicMock()
    #     mock_joy2.to_dict.return_value = {"joy_rating": 5}

    #     self.mock_db.collection.return_value.where.return_value.where.return_value.where.return_value.get.return_value = [mock_joy1, mock_joy2]

    #     # Mock the group document to be updated
    #     group_doc = MagicMock()
    #     group_doc.to_dict.return_value = {"avg_joy": {}}
    #     self.mock_db.collection.return_value.where.return_value.get.return_value = [group_doc]

    #     # Call the function
    #     result = self.db_wrapper.calculateJoyAverage(group_id, test_date)

    #     # Calculate the expected average
    #     expected_avg = round((3 + 5) / 2, 2)
    #     expected_avg_joy = {test_date.strftime("%d/%m/%Y"): expected_avg}
        
    #     # Ensure the update is called with the correct avg_joy structure
    #     group_doc.reference.update.assert_called_once_with({"avg_joy": expected_avg_joy})
    #     self.assertTrue(result)

    @patch("firebase_admin.firestore.client")
    def test_getTeamJoy(self, mock_firestore_client):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"avg_joy": {"20/12/2024": 4.5}}
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.getTeamJoy("group123")

        # Verify the returned average joy rating
        self.assertEqual(result, {"20/12/2024": 4.5})

if __name__ == '__main__':
    unittest.main()
