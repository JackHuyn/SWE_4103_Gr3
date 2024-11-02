import ContributionsGraph from '../app/ui/metrics/contributions-graph'
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input'
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart'
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph'
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph'
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input'
import '@/app/ui/stylesheets/metrics.css'
import { redirect } from 'next/dist/server/api-utils'
import { useEffect } from 'react'

const group_id = 'TEMPLATE'

async function closeDialogs()
{
    document.getElementById('metrics-dialog-backdrop').style.display = 'none'
    document.getElementById('team-velocity-dialog').style.display = 'none'
    document.getElementById('joy-rating-dialog').style.display = 'none'
}

export default function Metrics() {

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

    async function openJoyRatingDialog() 
    {
        document.getElementById('metrics-dialog-backdrop').style.display = 'block'
        document.getElementById('joy-rating-dialog').style.display = 'block'
    }
    async function openTeamVelocityDialog() 
    {
        document.getElementById('metrics-dialog-backdrop').style.display = 'block'
        document.getElementById('team-velocity-dialog').style.display = 'block'
    }

    return (
        <div>
            <div>
                <button onClick={openJoyRatingDialog}>Open Joy Rating Dialog</button>
                <button onClick={openTeamVelocityDialog}>Open Team Velocity Dialog</button>
                <button onClick={redirectToGitHubAppAuthorization}>GitHub App Authorization</button>
            </div>
            <div>
                <ContributionsGraph />
                <JoyAvgChart />
                <JoyStudentRatingGraph />
                <TeamVelocityGraph />
            </div>
            <div id="metrics-dialog-backdrop" onClick={closeDialogs}></div>
            <TeamVelocityInput />
            <JoyRatingInput />
        </div>
    )
}