# import unittest
# from unittest.mock import MagicMock, patch
# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from FileUpload import save_file  

# class TestFileUpload(unittest.TestCase):

#     @patch('os.path.exists')
#     @patch('os.makedirs')
#     def test_save_file_directory_exists(self, mock_makedirs, mock_path_exists):
#         # Simulate that the directory exists
#         mock_path_exists.return_value = True

#         # Mock file object
#         mock_file = MagicMock()
#         mock_file.filename = 'test.csv'

#         # Use the 'Test/Uploads' directory for testing
#         test_uploads_folder = os.path.join(os.path.dirname(__file__), 'Uploads')

#         # Call the function with the test folder
#         save_file(mock_file, uploads_folder=test_uploads_folder)

#         # Verify that the save method was called with the correct file path
#         expected_path = os.path.join(test_uploads_folder, 'test.csv')
#         mock_file.save.assert_called_once_with(expected_path)

#     @patch('os.path.exists')
#     @patch('os.makedirs')
#     def test_save_file_create_directory(self, mock_makedirs, mock_path_exists):
#         # Simulate that the directory does not exist
#         mock_path_exists.return_value = False

#         # Mock file object
#         mock_file = MagicMock()
#         mock_file.filename = 'test.csv'

#         # Use the 'Test/Uploads' directory for testing
#         test_uploads_folder = os.path.join(os.path.dirname(__file__), 'Uploads')

#         # Call the function with the test folder
#         save_file(mock_file, uploads_folder=test_uploads_folder)

#         # Verify that makedirs was called to create the directory
#         mock_makedirs.assert_called_once_with(test_uploads_folder)

#         # Verify that the save method was called with the correct file path
#         expected_path = os.path.join(test_uploads_folder, 'test.csv')
#         mock_file.save.assert_called_once_with(expected_path)

# if __name__ == '__main__':
#     unittest.main()
