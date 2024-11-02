import { useEffect } from "react";
import '@/app/ui/stylesheets/default.css'
import { redirect } from "next/dist/server/api-utils";
import Cookies from 'js-cookie';

export default function GitHubCodeRequest() {

    useEffect(() => {
        const queryParameters = new URLSearchParams(window.location.search)
        let code = queryParameters.get("code")
        console.log(code)

        const local_id = Cookies.get('localId')
        const id_token = Cookies.get('idToken')

        fetch("http://127.0.0.1:3001/auth/github-code-request?localId="+local_id+"&idToken="+id_token+"&code="+code,
            {
                method: 'POST'
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
                window.location.href = '/metrics'
                
            } catch(err) {
                console.log(err)
            }
        }).catch((error) => {
            console.log(error)
        })

        //redirect()
    }, [])

    return (
        <div>
            <h1>Redirecting...</h1>
        </div>
    )
}