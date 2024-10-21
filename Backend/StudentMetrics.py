from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

import GitHub as github

class StudentMetrics:

    def __init__(self, db) -> None:
        self.db = db

    def get_student_joy_ratings(self, project_id, anonymous=True):
        raw_ratings = self.db.getStudentJoyRatings(project_id)
        if anonymous is False:
            return raw_ratings
        ratings = []
        for r in raw_ratings:
            ratings.append({'joy_rating': r['joy_rating'], 'date': r['date']})
        return ratings
    
    def add_student_joy_ratings(self, project_id, uid, joy_rating):
        return self.db.addStudentJoyRatings(project_id, uid, joy_rating)
    
    def get_github_contribution_stats(self, project_id):
        repo_address = self.db.getGithubRepoAddress(project_id)
        git = github.GitHubManager(repo_address)
        return git.get_contributions()
