from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from datetime import datetime as dt

import GitHub as github

class StudentMetrics:

    def __init__(self, db) -> None:
        self.db = db

    def get_avg_team_joy_ratings(self, group_id): #get avg of a given group per day and dict
        try:
            all_ratings = self.db.getTeamJoy(group_id)
            # print('Ratings: ', all_ratings)
            ratings = []
            for rating in all_ratings:
                ratings.append({
                    'avg': rating['rating'],
                    'date': str(rating['date'])
                })
            print(ratings)
            # documents_by_date = {}

            # for doc in all_ratings:
            #     created_at = doc['timestamp'].timestamp() 
            #     date = dt.fromtimestamp(created_at).date()

            #     if date not in documents_by_date:
            #         documents_by_date[date] = []
            #     documents_by_date[date].append(doc)

            # # Create dictionary with date as key and average joy as value
            # avg_joy_by_date = {}
            # for date, docs in documents_by_date.items():
            #     joy_values = [] 
            #     for doc in docs:
            #         joy_values.append(doc['joydata'] )
            #     average_joy = sum(joy_values) / len(joy_values)
            #     avg_joy_by_date[date] = average_joy

            return ratings
        except Exception as e:
            print('METRICS ERROR')
            print(e)   
        

    def get_recent_student_joy_ratings(self, group_id): # Return Most Recent Joy Rating for each Student
        raw_ratings = self.db.getRecentStudentJoyRatings(group_id)
        return raw_ratings
    
    def add_student_joy_rating(self, group_id, uid, joy_rating):
        print(joy_rating)
        return self.db.addJoyRating(uid, group_id, joy_rating)
    
    def get_github_contribution_stats(self, project_id):
        repo_address = self.db.getGithubRepoAddress(project_id)
        git = github.GitHubManager(repo_address)
        return git.get_contributions()
