import '@/app/ui/stylesheets/githubAppAuthorizationDialog.css'

let star_rating: number = 0

const group_id = 'TEMPLATE' //REPLACE THIS ASAP

export default function GitHubAppAuthorizationDialog()
{

    async function redirectToGitHubAppAuthorization()
    {
        fetch("http://127.0.0.1:3001/auth/get-github-app-client-id",
            {
                method: 'GET'
            }
        ).then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        text: "Server not found!",
                        status: "danger"
                    };
                }
      
                return response.text().then(text => {
                    return {
                        text: text,
                        status: "danger"
                    };
                })
            }
            return response.text().then(text => {
                return {
                    text: text,
                    status: "success"
                };
            })
        }).then(resp => {
            console.log("result:", resp);
            try {
                let r = JSON.parse(resp.text)
                if(!r['approved'])
                    throw 'idek bro'
                console.log(r)
                const client_id = r['clientId']
                window.location.assign('https://github.com/login/oauth/authorize?client_id='+client_id)
                
            } catch(err) {
                console.log(err)
            }
        }).catch((error) => {
            console.log(error)
        })
       
    }

    return(
        <div id="github-app-authorization-dialog">
            <h3>GitHub App Authorization Required</h3>
            <button onClick={redirectToGitHubAppAuthorization}>Authorize App</button>
        </div>
    )
}