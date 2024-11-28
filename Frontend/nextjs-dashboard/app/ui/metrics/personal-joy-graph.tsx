import Chart from 'chart.js/auto'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function PersonalJoyChart({group_id})
{
    useEffect(() => {
        if (group_id) {
            const local_id = Cookies.get('localId');
            console.log('GET CHART CALLED')
            let contributions = []
            fetch("http://127.0.0.1:3001/metrics/get-individual-joy-ratings?groupId="+group_id+"&localId="+local_id,
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
                    console.log('Personal Joy Data: ', r)
                    //let weeks = []
                    const joy_data = r['joyData']
                    const days = joy_data.map(row => row.date)
        
                    let joy_graph_data = 
                        [
                            {
                                label: 'Rating',
                                data: joy_data.map(row => row.joy_rating)
                            }
                        ]
        
                    const config = {
                        type: 'line',
                        data: {
                            labels: days,
                            datasets: joy_graph_data
                        },
                        options: {
                            indexAxis: 'x',
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            },
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
                            document.getElementById('personal-joy-graph'),
                            config
                        )
                } catch(err) {
                    console.log(err)
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [group_id])

    return(
        <div id="avg-joy-container">
            <h3>Personal Joy</h3>
            <div style={{width: '800px'}}><canvas id="personal-joy-graph"></canvas></div>
        </div>
    )
}