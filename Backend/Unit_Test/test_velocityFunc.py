import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from unittest.mock import MagicMock, patch
from datetime import datetime
from DbWrapper.DbWrapper import DbWrapper  


class TestDbWrapperVelocityManagement(unittest.TestCase):
    @patch("firebase_admin.firestore.client")
    def setUp(self, mock_firestore_client):
        self.db = mock_firestore_client()
        self.db_wrapper = DbWrapper(self.db)

    def test_addVelocityData(self):
        self.db.collection().document().set = MagicMock()
        
        sprint_start = datetime(2024, 11, 1)
        sprint_end = datetime(2024, 11, 10)
        result = self.db_wrapper.addVelocityData("group1", sprint_start, sprint_end, planned_points=30, completed_points=25)
        
        self.db.collection().document().set.assert_called_once()
        self.assertTrue(result)

    def test_updateVelocityData(self):
        self.db.collection().document().update = MagicMock()
        
        sprint_start = datetime(2024, 11, 1)
        result = self.db_wrapper.updateVelocityData("velocity1", sprint_start=sprint_start, completed_points=20)
        
        self.db.collection().document().update.assert_any_call({"sprint_start": sprint_start})
        self.db.collection().document().update.assert_any_call({"completed_points": 20})
        self.assertTrue(result)

    def test_getTeamVelocity(self):
        mock_velocity_docs = [
            MagicMock(to_dict=MagicMock(return_value={"sprint_num": 1, "planned_points": 20, "completed_points": 15})),
            MagicMock(to_dict=MagicMock(return_value={"sprint_num": 2, "planned_points": 25, "completed_points": 20})),
        ]
        self.db.collection().where().stream.return_value = mock_velocity_docs
        
        result = self.db_wrapper.getTeamVelocity("group1")
        
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["completed_points"], 15)
        self.assertEqual(result[1]["planned_points"], 25)

    def test_removeVelocity(self):
        self.db.collection().document().delete = MagicMock()
        
        result = self.db_wrapper.removeVelocity("velocity1")
        
        self.db.collection().document().delete.assert_called_once()
        self.assertTrue(result)


if __name__ == "__main__":
    unittest.main()
