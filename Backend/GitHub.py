import base64
from github import Github, Auth, NamedUser
from pprint import pprint
import requests

# API Documentation: 
# https://github.com/PyGithub/PyGithub
# https://pygithub.readthedocs.io/en/latest/index.html

GITHUB_BASE_URL = 'https://api.github.com'

class GitHubManager:

    def __init__(self, repo_address) -> None:
        self.repo_address = repo_address
        auth = Auth.Token("")
        self.github = Github(auth = auth, base_url=GITHUB_BASE_URL)
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
                commit_counts[author] = {'additions': c.stats.additions, 'deletions': c.stats.deletions, 'total': c.stats.total}
            else:
                commit_counts[author]['additions'] += c.stats.additions
                commit_counts[author]['deletions'] += c.stats.deletions
                commit_counts[author]['total'] += c.stats.total
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


if __name__ == '__main__':
    g = Github(base_url=GITHUB_BASE_URL)

    swe_repo = g.get_repo("JackHuyn/SWE_4103_Gr3")
    open_issues = swe_repo.get_issues(state='open')
    print(swe_repo.name)
    print("---------------------------")

    for issue in open_issues:
        print(issue)
        print(issue.assignee)
        print(issue.state)
        for comment in issue.get_comments():
            print(comment.body)

    print("---------------------------")

    # contributors = swe_repo.get_contributors()
    # for c in contributors:
    #     print(c)

    commits = swe_repo.get_commits()
    commit_counts = {}
    for c in commits:
        try:
            author = c.commit.author.name
        except Exception as e:
            print(e)
            author = "None"
        if author not in commit_counts:
            commit_counts[author] = {'additions': c.stats.additions, 'deletions': c.stats.deletions, 'total': c.stats.total}
        else:
            commit_counts[author]['additions'] += c.stats.additions
            commit_counts[author]['deletions'] += c.stats.deletions
            commit_counts[author]['total'] += c.stats.total
        # print(author, "\t", c.stats.additions, "\t", c.stats.deletions, "\t", c.stats.total)


    print("---------------------------")
    pprint(commit_counts)
    print("---------------------------")


    g.close()