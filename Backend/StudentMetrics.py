from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from datetime import datetime as dt

import GitHub as github

class StudentMetrics:

    def __init__(self, db) -> None:
        self.db = db

    def get_avg_team_joy_ratings(self, group_id): #get avg of a given group per day and dict
        all_ratings = self.db.getTeamJoy(group_id)
        print('Ratings: ', all_ratings)
        ratings = []
        for rating in all_ratings:
            print('RATING SM: ', rating)
            ratings.append({
                'avg': all_ratings[rating],
                'date': str(rating)
            })
        ratings = sorted(ratings, key=lambda x: x['date'])
        print(ratings)

        return ratings

    def get_recent_student_joy_ratings(self, group_id): # Return Most Recent Joy Rating for each Student
        raw_ratings = self.db.getRecentStudentJoyRatings(group_id)
        for rating in raw_ratings:
            print('Rating: ', rating)
            userdata = self.db.getUserData(rating['student_id'])
            print('User data: \t', userdata)
            if(userdata):
                rating['student_id'] = str(userdata['first_name']) + ' ' + str(userdata['last_name'])[0] + '.'
        return raw_ratings
    
    def get_recent_individual_joy_ratings(self, group_id, uid): # Return Most Recent Joy Rating for each Student
        raw_ratings = self.db.getIndividualRecentJoyRatings(group_id, uid)
        for rating in raw_ratings:
            userdata = self.db.getUserData(rating['student_id'])
            if(userdata):
                rating['student_id'] = str(userdata['first_name']) + ' ' + str(userdata['last_name'])[0] + '.'
        return raw_ratings
    
    def get_individual_current_day_joy_rating(self, group_id:str, uid:str):
        return self.db.getIndividualCurrentDayJoyRating(group_id, uid)
    
    def add_student_joy_rating(self, group_id, uid, joy_rating, comment):
        print(joy_rating)
        return self.db.addJoyRating(uid, group_id, joy_rating, comment)
    
    def get_team_velocity(self, group_id):
        # return [
        #     {
        #         'planned_points': 13,
        #         'completed_points': 10,
        #         'sprint_start_date': str(dt(2024, 10, 12)),
        #         'sprint_end_date': str(dt(2024, 9, 26))
        #     },
        #     {
        #         'planned_points': 15,
        #         'completed_points': 16,
        #         'sprint_start_date': str(dt(2024, 9, 26)),
        #         'sprint_end_date': str(dt(2024, 10, 10))
        #     },
        #     {
        #         'planned_points': 10,
        #         'completed_points': 12,
        #         'sprint_start_date': str(dt(2024, 10, 10)),
        #         'sprint_end_date': str(dt(2024, 10, 24))
        #     },
        #     {
        #         'planned_points': 19,
        #         'completed_points': 12,
        #         'sprint_start_date': str(dt(2024, 10, 24)),
        #         'sprint_end_date': str(dt(2024, 10, 7))
        #     }
        # ]
        return self.db.getTeamVelocity(group_id)
    
    def submit_team_velocity(self, group_id, start_date, end_date, planned_story_points, completed_story_points):
        return self.db.addVelocityData(group_id, start_date, end_date, planned_story_points, completed_story_points)
    
    def get_github_contribution_stats(self, auth, group_id):
        repo_address = self.db.getGithubRepoAddress(group_id)
        git = github.GitHubManager(auth, repo_address)
        print('git setup')
        return git.get_contributions()


    def get_avg_truck_factor(self, group_id:str):
        ratings = self.db.getTruckFactorRatings(group_id)
        sum = 0
        for rating in ratings:
            try:
                sum += rating['truck_factor']
            except Exception as e:
                pass
        return sum / len(ratings)
    
    def get_users_recent_truck_factor(self, group_id:str, uid:str):
        return self.db.getUsersRecentTruckFactor(group_id, uid).to_dict()

    def submit_truck_factor(self, group_id:str, uid:str, truck_factor:int, comment:str) -> bool:
        return self.db.submitTruckFactorRating(group_id, uid, truck_factor, comment)
