import base64
from github import Github, Auth, NamedUser
from pprint import pprint
import requests

# API Documentation: 
# https://github.com/PyGithub/PyGithub
# https://pygithub.readthedocs.io/en/latest/index.html

GITHUB_BASE_URL = 'https://api.github.com'


def getOAuthTokenFromCode(client_id, client_secret, code):
    rest_api_url = "https://github.com/login/oauth/access_token"
    r = requests.post(rest_api_url,
                params={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code
                    })

    args = r.text.split('&')
    for arg in args:
        if(arg.startswith('access_token')):
            return arg.split('=')[1]
    
    return {}

def getGitHubLogin(auth):
    g = Github(auth=auth, base_url=GITHUB_BASE_URL)
    return g.get_user().login

class GitHubManager:

    def __init__(self, auth, repo_address) -> None:
        self.repo_address = repo_address
        self.github = Github(auth=auth, base_url=GITHUB_BASE_URL)
        self.repo = self.github.get_repo(self.repo_address)

    def get_commit_data(self):
        commits = self.repo.get_commits()
        commit_counts = {}
        for c in commits:
            try:
                author = c.commit.author.name
            except Exception as e:
                print(e)
                author = "None"
            if author not in commit_counts:
                commit_counts[author] = {'additions': c.stats.additions, 'deletions': c.stats.deletions, 'total': c.stats.total, 'num_commits': 1}
            else:
                commit_counts[author]['additions'] += c.stats.additions
                commit_counts[author]['deletions'] += c.stats.deletions
                commit_counts[author]['total'] += c.stats.total
                commit_counts[author]['num_commits'] += 1
            # print(author, "\t", c.stats.additions, "\t", c.stats.deletions, "\t", c.stats.total)
        return commit_counts
    
    def get_open_issues(self):
        open_issues = self.repo.get_issues(state='open')
        issues = {}
        for issue in open_issues:
            # comments = []
            # for comment in issue.get_comments():
            #     comments.append(comment.body)

            issues[issue.number] = {
                'title': issue.title,
                'assignee': issue.assignee,
                'state': issue.state
            }
            
        return issues
    
    def get_contributions(self):
        stats = self.repo.get_stats_contributors()
        contributions = []
        for s in stats:
            con = {}
            # print("-", s.author)
            con['author'] = s.author.login
            con['contributions'] = []
            for week in s.weeks:
                # print(week.w, "\t", week.a, "\t", week.d, "\t", week.c)
                con['contributions'].append({'week': str(week.w), 'additions': week.a, 'deletions': week.d, 'commits': week.c})
            contributions.append(con)
        return contributions


if __name__ == '__main__':
    auth = Auth.Token("")
    g = Github(base_url=GITHUB_BASE_URL)

    swe_repo = g.get_repo("JackHuyn/SWE_4103_Gr3")
    # open_issues = swe_repo.get_issues(state='open')
    # print(swe_repo.name)
    # print("---------------------------")

    # for issue in open_issues:
    #     print(issue)
    #     print(issue.assignee)
    #     print(issue.state)
    #     for comment in issue.get_comments():
    #         print(comment.body)

    print("---------------------------")

    # contributors = swe_repo.get_contributors()
    # for c in contributors:
    #     print(c)

    # repo_obj = GitHubManager('JackHuyn/SWE_4103_Gr3')

    # print(swe_repo.get_rate_limit())

    # activity = swe_repo.get_stats_contributors()
    # for a in activity:
    #     print("-", a.author)
    #     for week in a.weeks:
    #         print(week.w, "\t", week.a, "\t", week.d, "\t", week.c)


    # print("---------------------------")
    # pprint(commit_counts)
    # print("---------------------------")


    g.close()