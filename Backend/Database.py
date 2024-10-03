from firebase_admin import firestore

class Database:

    def __init__(self, app):
        self.app = app
        self.db = firestore.client()


    def get_user_template(self):
        doc_ref = self.db.collection('userdata').document('TEMPLATE')
        return doc_ref.get().to_dict()
    
