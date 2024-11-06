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
    def test_archiveCourse(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.archiveCourse("course123")
        mock_doc.update.assert_called_once_with({"status": 1})
        self.assertTrue(result)

    def test_archiveCourse_fail(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")
        result = self.db_wrapper.archiveCourse("course123")
        self.assertFalse(result)

    # 2. Test activateCourse
    def test_activateCourse(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.activateCourse("course123")
        mock_doc.update.assert_called_once_with({"status": 0})
        self.assertTrue(result)

    def test_activateCourse_fail(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")
        result = self.db_wrapper.activateCourse("course123")
        self.assertFalse(result)

    # 3. Test getUserData
    def test_getUserData(self):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"uid": "testuser", "email": "test@example.com"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getUserData("testuser")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"uid": "testuser", "email": "test@example.com"})

    # 4. Test getCourseData
    def test_getCourseData(self):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getCourseData("course123")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"course_id": "course123"})

    # 5. Test getStudentCourses
    def test_getStudentCourses(self):
        mock_course_doc = MagicMock()
        mock_course_doc.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course_doc]
        result = self.db_wrapper.getStudentCourses("student123")
        self.assertEqual(result, [{"course_id": "course123"}])

    # 6. Test getInstructorCourses
    def test_getInstructorCourses(self):
        mock_course_doc = MagicMock()
        mock_course_doc.to_dict.return_value = {"course_id": "course123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course_doc]
        result = self.db_wrapper.getInstructorCourses("instructor123")
        self.assertEqual(result, [{"course_id": "course123"}])

    # 7. Test getProjectData
    def test_getProjectData(self):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"project_id": "project123"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getProjectData("project123")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"project_id": "project123"})

    # 8. Test getProjectGroups
    def test_getProjectGroups(self):
        mock_group_doc = MagicMock()
        mock_group_doc.to_dict.return_value = {"group_id": "group123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group_doc]
        result = self.db_wrapper.getProjectGroups("project123")
        self.assertEqual(result, [{"group_id": "group123"}])

    # 9. Test getCourseProjects
    def test_getCourseProjects(self):
        mock_project_doc = MagicMock()
        mock_project_doc.to_dict.return_value = {"project_id": "project123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_project_doc]
        result = self.db_wrapper.getCourseProjects("course123")
        self.assertEqual(result, [{"project_id": "project123"}])

    # 10. Test getGroupData
    def test_getGroupData(self):
        mock_doc = MagicMock()
        mock_doc.get.return_value.to_dict.return_value = {"group_id": "group123"}
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.getGroupData("group123")
        mock_doc.get.assert_called_once()
        self.assertEqual(result, {"group_id": "group123"})

    # 11. Test getStudentGroups
    def test_getStudentGroups(self):
        mock_group_doc = MagicMock()
        mock_group_doc.to_dict.return_value = {"group_id": "group123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group_doc]
        result = self.db_wrapper.getStudentGroups("student123")
        self.assertEqual(result, [{"group_id": "group123"}])

    # 12. Test getTeamJoy
    def test_getTeamJoy(self):
        mock_joy_doc = MagicMock()
        mock_joy_doc.to_dict.return_value = {"joy_id": "joy123"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_joy_doc]
        result = self.db_wrapper.getTeamJoy("group123")
        self.assertEqual(result, [{"joy_id": "joy123"}])

    # 13. Test addUser
    def test_addUser(self):
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

    def test_addUser_existing(self):
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [MagicMock()]
        result = self.db_wrapper.addUser(1, "test@example.com", "Test", "User", "testuser")
        self.assertFalse(result)

    # 14. Test addStudentToCourse
    def test_addStudentToCourse(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.addStudentToCourse("student123", "course123")
        mock_doc.update.assert_called_once_with({"student_ids": ArrayUnion(["student123"])})
        self.assertTrue(result)

    def test_addStudentToCourse_fail(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")
        result = self.db_wrapper.addStudentToCourse("student123", "course123")
        self.assertFalse(result)

    # 15. Test addInstructorToCourse
    def test_addInstructorToCourse(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        result = self.db_wrapper.addInstructorToCourse("instructor123", "course123")
        mock_doc.update.assert_called_once_with({"instructor_ids": ArrayUnion(["instructor123"])})
        self.assertTrue(result)

    def test_addInstructorToCourse_fail(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")
        result = self.db_wrapper.addInstructorToCourse("instructor123", "course123")
        self.assertFalse(result)

    # 16. Test addCourse
    def test_addCourse(self):
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

    def test_addCourse_existing(self):
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [MagicMock()]
        result = self.db_wrapper.addCourse("Test Course", "course123", ["instructor123"], "FR01A", "FA2024", [])
        self.assertFalse(result)

    # 17. Test addProject
    def test_addProject(self):
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

    def test_addProject_existing(self):
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [MagicMock()]
        result = self.db_wrapper.addProject("course123", "proj123", "Project 1", "github.com/repo")
        self.assertFalse(result)
    # # 18. Test addGroup
    # def test_addGroup(self):
    #     # Mock the return value for getProjectGroups and getProjectData
    #     self.db_wrapper.getProjectGroups = MagicMock(return_value=[{"group_id": "proj1_gr0"}])
    #     self.db_wrapper.getProjectData = MagicMock(return_value={"project_name": "Test Project"})
    #     mock_collection = MagicMock()
    #     self.mock_db.collection.return_value = mock_collection

    #     result = self.db_wrapper.addGroup("proj1")

    #     # Verify that the group is added
    #     mock_collection.document.return_value.set.assert_called_once_with({
    #         "group_id": "proj1_gr1",
    #         "group_name": "Test Project Group 1",
    #         "project_id": "proj1",
    #         "student_ids": []
    #     })
    #     self.assertTrue(result)

    # 19. Test for `addNGroups`
    def test_addNGroups(self):
        self.db_wrapper.addGroup = MagicMock(return_value=True)
        
        result = self.db_wrapper.addNGroups("proj1", 3)

        # Verify that addGroup was called 3 times
        self.assertEqual(self.db_wrapper.addGroup.call_count, 3)
        self.assertTrue(result)

    # 20. Test for `addStudentToGroup`
    def test_addStudentToGroup(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addStudentToGroup("group123", "student123")

        # Verify that the student was added to the group
        mock_doc.update.assert_called_once_with({"student_ids": ArrayUnion(["student123"])})
        self.assertTrue(result)

    def test_addStudentToGroup_fail(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")

        result = self.db_wrapper.addStudentToGroup("group123", "student123")

        self.assertFalse(result)

    # 21. Test for `addJoyRating`
    def test_addJoyRating(self):
        self.db_wrapper.updateJoyRating = MagicMock(return_value=False)
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.addJoyRating("student123", "group123", 5)

        # Verify that the joy rating is added
        mock_doc.set.assert_called_once()
        self.assertTrue(result)

    def test_addJoyRating_existing(self):
        # If updateJoyRating returns True, it should bypass adding a new rating
        self.db_wrapper.updateJoyRating = MagicMock(return_value=True)

        result = self.db_wrapper.addJoyRating("student123", "group123", 5)

        # Verify that set was not called since updateJoyRating was successful
        self.mock_db.collection.return_value.document.return_value.set.assert_not_called()
        self.assertTrue(result)

    # 22. Test for `updateJoyRating`
    def test_updateJoyRating(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc

        result = self.db_wrapper.updateJoyRating("student123", "group123", 5)

        # Verify that the joy rating is updated
        mock_doc.update.assert_called_with({"joy_rating": 5})
        mock_doc.update.assert_called_with({"timestamp": self.mock_db.SERVER_TIMESTAMP})
        self.assertTrue(result)

    def test_updateJoyRating_fail(self):
        mock_doc = MagicMock()
        self.mock_db.collection.return_value.document.return_value = mock_doc
        mock_doc.update.side_effect = Exception("Error")

        result = self.db_wrapper.updateJoyRating("student123", "group123", 5)

        self.assertFalse(result)
    
    # 23. Test for removeCourse
    def test_removeCourse(self):
        # Simulate a course found in the database
        mock_course = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course]

        result = self.db_wrapper.removeCourse("course123")

        # Verify that the document was deleted
        self.mock_db.collection.return_value.document.return_value.delete.assert_called_once()
        self.assertTrue(result)

    def test_removeCourse_not_found(self):
        # Simulate no course found in the database
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.removeCourse("course123")

        # Check that the function returns False if no course is found
        self.assertFalse(result)

    def test_removeCourse_fail(self):
        # Simulate a course found in the database
        mock_course = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_course]

        # Simulate a failure during the deletion process
        self.mock_db.collection.return_value.document.return_value.delete.side_effect = Exception("Error")

        result = self.db_wrapper.removeCourse("course123")

        # Verify that the method returns False on failure
        self.assertFalse(result)

    # 24. Test for `removeProject`
    def test_removeProject(self):
        # Simulate a project found in the database
        mock_project = MagicMock()
        mock_project.to_dict.return_value = {"project_id": "proj123"}
        self.db_wrapper.getProjectGroups = MagicMock(return_value=[{"group_id": "group1"}, {"group_id": "group2"}])
        self.db_wrapper.removeGroup = MagicMock(return_value=True)
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_project]

        result = self.db_wrapper.removeProject("proj123")

        # Verify that the associated groups are removed and the project is deleted
        self.db_wrapper.removeGroup.assert_any_call("group1")
        self.db_wrapper.removeGroup.assert_any_call("group2")
        self.mock_db.collection.return_value.document.return_value.delete.assert_called_once()
        self.assertTrue(result)

    def test_removeProject_not_found(self):
        # Simulate no project found in the database
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.removeProject("proj123")

        # Check that the function returns False if no project is found
        self.assertFalse(result)

    def test_removeProject_fail(self):
        # Simulate a project found in the database
        mock_project = MagicMock()
        mock_project.to_dict.return_value = {"project_id": "proj123"}
        self.db_wrapper.getProjectGroups = MagicMock(return_value=[{"group_id": "group1"}, {"group_id": "group2"}])
        self.db_wrapper.removeGroup = MagicMock(return_value=True)
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_project]

        # Simulate a failure during the deletion process
        self.mock_db.collection.return_value.document.return_value.delete.side_effect = Exception("Error")

        result = self.db_wrapper.removeProject("proj123")

        # Verify that the method returns False on failure
        self.assertFalse(result)

    # 25. Test for `removeGroup`
    def test_removeGroup(self):
        # Simulate a group found in the database
        mock_group = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group]

        result = self.db_wrapper.removeGroup("group123")

        # Verify that the document was deleted
        self.mock_db.collection.return_value.document.return_value.delete.assert_called_once()
        self.assertTrue(result)

    def test_removeGroup_not_found(self):
        # Simulate no group found in the database
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.removeGroup("group123")

        # Check that the function returns False if no group is found
        self.assertFalse(result)

    def test_removeGroup_fail(self):
        # Simulate a group found in the database
        mock_group = MagicMock()
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_group]

        # Simulate a failure during the deletion process
        self.mock_db.collection.return_value.document.return_value.delete.side_effect = Exception("Error")

        result = self.db_wrapper.removeGroup("group123")

        # Verify that the method returns False on failure
        self.assertFalse(result)

    # 26. Test for `findUser`
    def test_findUser(self):
        # Simulate user found in the database
        mock_user = MagicMock()
        mock_user.to_dict.return_value = {"email": "test@example.com", "name": "Test User"}
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [mock_user]

        result = self.db_wrapper.findUser("test@example.com")

        # Verify that the document was fetched and returned correctly
        self.assertEqual(result, {"email": "test@example.com", "name": "Test User"})

    def test_findUser_not_found(self):
        # Simulate no user found in the database
        self.mock_db.collection.return_value.where.return_value.stream.return_value = []

        result = self.db_wrapper.findUser("test@example.com")

        # Check that the function returns None if no user is found
        self.assertIsNone(result)

    
if __name__ == '__main__':
    unittest.main()
