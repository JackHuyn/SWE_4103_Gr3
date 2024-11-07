import Chart from 'chart.js/auto'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router';

export default function JoyStudentRatingGraph({group_id})
{

    useEffect(() => {
        if (group_id) {
            console.log('GET CHART CALLED')
            let contributions = []
            fetch("http://127.0.0.1:3001/metrics/get-student-joy-ratings?groupId="+group_id,
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
                    
                    const joy_data = r['joyData']
                    const student_ids = joy_data.map(row => row.student_id)
        
                    let joy_graph_data = []
                    joy_graph_data.push({
                        label: 'Joy Rating',
                        data: joy_data.map(row => row.joy_rating)
                    })
        
                    const config = {
                        type: 'bar',
                        data: {
                            labels: student_ids,
                            datasets: joy_graph_data
                        },
                        options: {
                        indexAxis: 'y',
                        // Elements options apply to all of the options unless overridden in a dataset
                        // In this case, we are setting the border of each horizontal bar to be 2px wide
                        elements: {
                            bar: {
                            borderWidth: 2,
                            }
                        },
                        ticks: {
                            min: 0,
                            max: 5,
                            suggestedMin: 0,
                            suggestedMax: 5,
                            stepSize: 1,
                            autoSkip: false
                        },
                        layout: {
                            padding: {
                                left: 0,
                                right: 0,
                                top: 2,
                                bottom: 2
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    minTicksLimit: 5
                                }
                            }
                        },
                        responsive: true,
                        plugins: {
                            legend: {
                            position: 'none',
                            },
                            title: {
                            display: false,
                            text: 'Student Recent Joy'
                            }
                        },
                        maintainAspectRatio: false
                        },
                    };
                    
                    return new Chart(
                            document.getElementById('student-joy-graph'),
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
            <h3>Recent Student Joy</h3>
            <div style={{width: '800px'}}><canvas id="student-joy-graph"></canvas></div>
        </div>
    )
}