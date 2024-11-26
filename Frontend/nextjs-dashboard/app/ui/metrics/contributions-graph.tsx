import Chart from 'chart.js/auto'
import { groupEnd } from 'console';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import GitHubAppAuthorizationDialog from './github-app-authorization-dialog';
import Loading from '@/app/ui/Loading.tsx';
import '@/app/ui/stylesheets/loading.css'; 
import '@/app/ui/stylesheets/contributions-graph.css'; 



export default function ContributionsGraph( {group_id})
{
    console.log('CONTRIBUTIONS GROUP ID RECEIVED: '+group_id)

    const[authDialog,showAuthDialog] = useState(false);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        if (group_id) {
            const local_id = Cookies.get('localId')

            fetch("http://127.0.0.1:3001/metrics/contributions?localId="+local_id+"&groupId="+group_id,
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

                    if (response.status === 498) {// GitHub Authentication Error
                        // Show GitHub App Access Request Button
                        showAuthDialog(true);
                        return {
                            text: "GitHub Authentication Error",
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
                console.log("Contributions Result:", resp);
                try {
                    let r = JSON.parse(resp.text)
                    if(!r['approved'])
                        throw 'idek bro'
                    console.log(r)
                    //let weeks = []
                    const contributions = r['contributions'][0]['contributions']
                    const weeks = contributions.map(row => row.week.split(' ')[0])
        
                    let commit_graph_data = []
                    let additions_graph_data = []
                    let deletions_graph_data = []
                    for(let contribution of r['contributions'])
                    {
                        commit_graph_data.push({
                            label: contribution['author'],
                            data: contribution['contributions'].map(row => row.commits)
                        })
                        additions_graph_data.push({
                            label: contribution['author'],
                            data: contribution['contributions'].map(row => row.additions)
                        })
                        deletions_graph_data.push({
                            label: contribution['author'],
                            data: contribution['contributions'].map(row => row.deletions)
                        })
                    }
                    
        
                    console.log('Weeks', weeks)
        
                    return [
                        new Chart(
                            document.getElementById('additions'),
                            {
                            type: 'line',
                            data: {
                                labels: weeks,
                                datasets: additions_graph_data
                            }
                            }
                        ),
                        new Chart(
                            document.getElementById('deletions'),
                            {
                            type: 'line',
                            data: {
                                labels: weeks,
                                datasets: deletions_graph_data
                            }
                            }
                        ),
                        new Chart(
                            document.getElementById('commits'),
                            {
                            type: 'line',
                            data: {
                                labels: weeks,
                                datasets: commit_graph_data
                            }
                            }
                        )
                    ]
                } catch(err) {
                    console.log(err)
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally(() => {
                setLoading(false); // Set loading to false after charts are ready
              });
        }
    }, [group_id]);


    return(
        <>
        
        <div id="charts">
            
            <div className="graph">
            {!loading && <h3>Commits</h3>}
            <div style={{width: '100%'}}><canvas id="commits"></canvas></div></div>
            <div className="graph">
            {!loading && <h3>Additions</h3>}
            {authDialog && <GitHubAppAuthorizationDialog />}
            <div style={{width: '100%'}}><canvas id="additions"></canvas></div></div>
            <div className="graph">
            {!loading && <h3>Deletions</h3>}
            <div style={{width: '100%'}}><canvas id="deletions"></canvas></div></div>
            
        </div></>
    )
}