import unittest
from unittest.mock import patch, mock_open, MagicMock
import os
from FileUpload import allowed_file, save_file  

class TestFileUpload(unittest.TestCase):

    def test_allowed_file(self):
        # Test with a valid CSV file
        self.assertTrue(allowed_file('test.csv'))
        
        # Test with an invalid file type
        self.assertFalse(allowed_file('test.txt'))
        
        # Test with a file with no extension
        self.assertFalse(allowed_file('test'))

    @patch('os.path.exists')
    @patch('os.makedirs')
    @patch('FileUpload.open', new_callable=mock_open)  # Mock the open call to prevent actual file writing
    def test_save_file(self, mock_file_open, mock_makedirs, mock_path_exists):
        # Mocking to simulate the existence of the directory
        mock_path_exists.return_value = False  # Simulate folder not existing
        
        # Mock file object
        mock_file = MagicMock()
        mock_file.filename = 'test.csv'

        # Call the function
        save_file(mock_file)
        
        # Check if makedirs was called to create the directory
        mock_makedirs.assert_called_once_with(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Uploads'))
        
        # Check if the file.save method was called with the correct file path
        mock_file.save.assert_called_once_with(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Uploads', 'test.csv'))

    @patch('os.path.exists')
    @patch('FileUpload.open', new_callable=mock_open)
    def test_save_file_directory_exists(self, mock_file_open, mock_path_exists):
        # Mocking to simulate the directory already existing
        mock_path_exists.return_value = True  # Simulate folder exists

        # Mock file object
        mock_file = MagicMock()
        mock_file.filename = 'test.csv'

        # Call the function
        save_file(mock_file)
        
        # makedirs should not be called since the folder already exists
        mock_path_exists.assert_called_once()
        
        # Check if the file.save method was called with the correct file path
        mock_file.save.assert_called_once_with(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Uploads', 'test.csv'))

if __name__ == '__main__':
    unittest.main()
