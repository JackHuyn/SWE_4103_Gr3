import Chart from 'chart.js/auto'
import { groupEnd } from 'console';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

let group_id = 'TEMPLATE'

export default function ContributionsGraph()
{

    useEffect(() => {

        const local_id = Cookies.get('localId')

        return fetch("http://127.0.0.1:3001/metrics/contributions?localId="+local_id+"&groupId="+group_id,
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
                    document.getElementById('metrics-dialog-backdrop').style.display = 'block'
                    document.getElementById('github-app-authorization-dialog').style.display = 'block'
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

        

        
    }, [])

    return(
        <div id="charts">
            <h3>Commits</h3>
            <div style={{width: '400px'}}><canvas id="commits"></canvas></div>
            <h3>Additions</h3>
            <div style={{width: '400px'}}><canvas id="additions"></canvas></div>
            <h3>Deletions</h3>
            <div style={{width: '400px'}}><canvas id="deletions"></canvas></div>
            
        </div>
    )
}