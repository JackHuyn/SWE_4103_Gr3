#Author : Raphael Ferreira 
#Helper functions for file uploads
import os

ALLOWED_EXTENSIONS = set(['csv'])



#Check if the file is a csv file 
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

#Saves file to the Uploads folder -> Need to check if the folder exists or not before saving
def save_file(file):
    dir_path = os.path.dirname(os.path.abspath(__file__))
    uploads_folder = os.path.join(dir_path,'Uploads')

    if not os.path.exists(uploads_folder):
        os.makedirs(uploads_folder)

    file.save(os.path.join(uploads_folder,file.filename))

    