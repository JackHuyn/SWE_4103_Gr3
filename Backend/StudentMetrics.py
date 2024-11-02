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
            print('Ratings: ', all_ratings)
            ratings = []
            for rating in all_ratings:
                ratings.append({
                    'avg': rating['rating'],
                    'date': str(rating['date'])
                })
            print(ratings)

            return ratings
        except Exception as e:
            print('METRICS ERROR')
            print(e)   
            return {}
        

    def get_recent_student_joy_ratings(self, group_id): # Return Most Recent Joy Rating for each Student
        raw_ratings = self.db.getRecentStudentJoyRatings(group_id)
        return raw_ratings
    
    def add_student_joy_rating(self, group_id, uid, joy_rating, comment):
        print(joy_rating)
        return self.db.addJoyRating(uid, group_id, joy_rating, comment)
    
    def get_team_velocity(self, group_id):
        return [
            {
                'planned_points': 13,
                'completed_points': 10,
                'sprint_start_date': str(dt(2024, 10, 12)),
                'sprint_end_date': str(dt(2024, 9, 26))
            },
            {
                'planned_points': 15,
                'completed_points': 16,
                'sprint_start_date': str(dt(2024, 9, 26)),
                'sprint_end_date': str(dt(2024, 10, 10))
            },
            {
                'planned_points': 10,
                'completed_points': 12,
                'sprint_start_date': str(dt(2024, 10, 10)),
                'sprint_end_date': str(dt(2024, 10, 24))
            },
            {
                'planned_points': 19,
                'completed_points': 12,
                'sprint_start_date': str(dt(2024, 10, 24)),
                'sprint_end_date': str(dt(2024, 10, 7))
            }
        ]
    
    def submit_team_velocity(self, group_id, start_date, end_date, planned_story_points, completed_story_points):
        print(group_id, start_date, end_date, planned_story_points, completed_story_points)
    
    def get_github_contribution_stats(self, auth, group_id):
        repo_address = self.db.getGithubRepoAddress(group_id)
        git = github.GitHubManager(auth, repo_address)
        return git.get_contributions()
