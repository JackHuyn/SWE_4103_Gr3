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
    file.save(os.path.join('Uploads',file.filename))
    