from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from datetime import datetime as dt

import GitHub as github

class StudentMetrics:

    def __init__(self, db) -> None:
        self.db = db

    def get_avg_team_joy_ratings(self, group_id): #get avg of a given group per day and dict
        all_ratings = self.db.getTeamJoy(group_id)
        documents_by_date = {}

        for doc in all_ratings:
            created_at = doc['timestamp'].timestamp() 
            date = dt.fromtimestamp(created_at).date()

            if date not in documents_by_date:
                documents_by_date[date] = []
            documents_by_date[date].append(doc)

        # Create dictionary with date as key and average joy as value
        avg_joy_by_date = {}
        for date, docs in documents_by_date.items():
            joy_values = [] 
            for doc in docs:
                joy_values.append(doc['joydata'] )
            average_joy = sum(joy_values) / len(joy_values)
            avg_joy_by_date[date] = average_joy

        return avg_joy_by_date           
        

    def get_student_joy_ratings(self, project_id, anonymous=True): # Return Most Recent Joy Rating for each Student
        raw_ratings = self.db.getTeamJoy(project_id)
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
