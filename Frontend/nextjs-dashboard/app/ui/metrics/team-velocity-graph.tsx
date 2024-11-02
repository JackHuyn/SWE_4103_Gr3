import Chart from 'chart.js/auto'
import { useEffect } from 'react'

const groupId = 'TEMPLATE'

    

export default function TeamVelocityGraph()
{

    useEffect(() => {
        console.log('GET CHART CALLED')
        let contributions = []
        return fetch("http://127.0.0.1:3001/metrics/get-team-velocity?groupId="+groupId,
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
                //let weeks = []
                const velocity = r['velocity']
                const days = velocity.map(row => row.sprint_start_date)
    
                let team_velocity_graph_data = 
                    [
                        {
                            label: 'Completed',
                            data: velocity.map(row => row.completed_points)
                        },
                        {
                            label: 'Planned',
                            data: velocity.map(row => row.planned_points)
                        }
                    ]
    
                const config = {
                    type: 'bar',
                    data: {
                        labels: days,
                        datasets: team_velocity_graph_data
                    },
                    options: {
                        indexAxis: 'x',
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'none',
                          },
                          title: {
                            display: false,
                            text: 'Avg Joy'
                          }
                        }
                      }
                };
    
                return new Chart(
                        document.getElementById('team-velocity-graph'),
                        config
                    )
            } catch(err) {
                console.log(err)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    return(
        <div id="avg-joy-container">
            <h3>Team Velocity</h3>
            <div style={{width: '800px'}}><canvas id="team-velocity-graph"></canvas></div>
        </div>
    )
}