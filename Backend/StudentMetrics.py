from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from datetime import datetime as dt

import GitHub as github

class StudentMetrics:

    def __init__(self, db) -> None:
        self.db = db

    def get_avg_team_joy_ratings(self, project_id, group_id): # Return Most Recent Joy Rating for each Student
        return [
            {
                'date': str(dt(2024, 5, 1)),
                'avg': 5
            },
            {
                'date': str(dt(2024, 5, 2)),
                'avg': 2.5
            },
            {
                'date': str(dt(2024, 5, 3)),
                'avg': 4
            },
            {
                'date': str(dt(2024, 5, 4)),
                'avg': 3
            },
            {
                'date': str(dt(2024, 5, 5)),
                'avg': 1
            }
        ]
    def get_student_joy_ratings(self, project_id): # Return Most Recent Joy Rating for each Student
        # raw_ratings = self.db.getTeamJoy(project_id)
        # if anonymous is False:
        #     return raw_ratings
        # ratings = []
        # for r in raw_ratings:
        #     ratings.append({'joy_rating': r['joy_rating'], 'date': r['date']})
        # return ratings

        return [
            {
                'date': str(dt(2024, 5, 1)),
                'joyRating': 5,
                'studentId': 'Will'
            },
            {
                'date': str(dt(2024, 5, 1)),
                'joyRating': 4,
                'studentId': 'Joseph'
            },
            {
                'date': str(dt(2024, 5, 1)),
                'joyRating': 3,
                'studentId': 'Brennan'
            },
            {
                'date': str(dt(2024, 5, 1)),
                'joyRating': 1,
                'studentId': 'Namneet'
            },
            {
                'date': str(dt(2024, 5, 1)),
                'joyRating': 5,
                'studentId': 'Sam'
            },
        ]
    
    def add_student_joy_ratings(self, project_id, uid, joy_rating):
        return self.db.addStudentJoyRatings(project_id, uid, joy_rating)
    
    def get_github_contribution_stats(self, project_id):
        repo_address = self.db.getGithubRepoAddress(project_id)
        git = github.GitHubManager(repo_address)
        return git.get_contributions()
