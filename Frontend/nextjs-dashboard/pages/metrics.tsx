import ContributionsGraph from '../app/ui/metrics/contributions-graph'
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input'
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart'
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph'
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph'
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input'
import '@/app/ui/stylesheets/loading.css'
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
import '@/app/ui/stylesheets/metrics.css'
import { redirect } from 'next/dist/server/api-utils'
import { useEffect, useState } from 'react'

const group_id = 'TEMPLATE'

async function closeDialogs()
{
    document.getElementById('metrics-dialog-backdrop').style.display = 'none'
    document.getElementById('team-velocity-dialog').style.display = 'none'
    document.getElementById('joy-rating-dialog').style.display = 'none'
}

export default function Metrics() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a graph loading delay (e.g., fetching data or rendering)
        const loadGraphs = setTimeout(() => {
            setLoading(false);
        }, 2000); // Adjust this delay as needed

        return () => clearTimeout(loadGraphs); // Cleanup timeout
    }, []);

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
            {loading ? (
                <div className="spinner-wrapper">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <div>
                        <button onClick={openJoyRatingDialog}>Open Joy Rating Dialog</button>
                        <button onClick={openTeamVelocityDialog}>Open Team Velocity Dialog</button>
                    </div>
                    <div>
                        <ContributionsGraph />
                        <JoyAvgChart />
                        <JoyStudentRatingGraph />
                        <TeamVelocityGraph />
                        <GitHubAppAuthorizationDialog />
                    </div>
                    <div id="metrics-dialog-backdrop" onClick={closeDialogs}></div>
                    <TeamVelocityInput />
                    <JoyRatingInput />
                </>
            )}
        </div>
    );
}