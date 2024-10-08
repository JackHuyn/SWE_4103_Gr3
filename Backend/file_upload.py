import os

#UPLOAD_FOLDER = 
ALLOWED_EXTENSIONS = set(['csv'])


#dir_path = os.path.dirname(os.path.realpath(__file__))
#cred = credentials.Certificate(dir_path + "\\" + credFileName)



def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    file.save(os.path.join('Uploads',file.filename))
    