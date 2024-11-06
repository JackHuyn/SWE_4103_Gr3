import '@/app/ui/stylesheets/githubAppAuthorizationDialog.css'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';


let star_rating: number = 0

const group_id = 'TEMPLATE' //REPLACE THIS ASAP

export default function GitHubAppAuthorizationDialog()
{

    const [isVisible, setIsVisible] = useState(false);
    

    useEffect(() => {
        // Fetch GitHub contributions and check for 498 status
        const localId = Cookies.get('localId');

        fetch(`http://127.0.0.1:3001/metrics/contributions?localId=${localId}&groupId=TEMPLATE`, {
            method: 'GET'
        })
        .then(response => {
            
            if (response.status === 498) {
                // Set dialog to visible if status is 498
                setIsVisible(true);
            }

            return response.json();
        })
        .then(data => {
            if (data && data.approved) {
                // Handle any additional logic if needed
                console.log('Data received:', data);
            }
        })
        .catch(error => console.error('Fetch error:', error));
    }, []);

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

    console.log(isVisible+"AAAAAAAAAAAAAAAA");

    if (!isVisible) return null;

    return(
        <div id="backdrop">
            <div id="github-app-authorization-dialog">
                <h3>GitHub App Authorization Required</h3>
                <button onClick={redirectToGitHubAppAuthorization}>Authorize App</button>
            </div>
        </div>
    )
}