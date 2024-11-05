import Chart from 'chart.js/auto';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function TeamVelocityGraph() {
    const [groupId, setGroupId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            const group_id = router.query.group_id;
            setGroupId(group_id);
            console.log("Group ID:", group_id);
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (groupId) {
            console.log('GET CHART CALLED with groupId:', groupId);
            fetch(`http://127.0.0.1:3001/metrics/get-team-velocity?groupId=${groupId}`, {
                method: 'GET',
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            text: "Server not found!",
                            status: "danger"
                        };
                    }
                    return response.text().then(text => ({ text, status: "danger" }));
                }
                return response.text().then(text => ({ text, status: "success" }));
            })
            .then(resp => {
                console.log("result:", resp);
                try {
                    let r = JSON.parse(resp.text);
                    if (!r['approved']) throw 'Data not approved';

                    const velocity = r['velocity'];
                    const days = velocity.map(row => row.sprint_start_date);
    
                    const team_velocity_graph_data = [
                        {
                            label: 'Completed',
                            data: velocity.map(row => row.completed_points)
                        },
                        {
                            label: 'Planned',
                            data: velocity.map(row => row.planned_points)
                        }
                    ];
    
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
    
                    new Chart(document.getElementById('team-velocity-graph'), config);
                } catch (err) {
                    console.error("Parsing error:", err);
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
        }
    }, [groupId]);

    return (
        <div id="avg-joy-container">
            <h3>Team Velocity</h3>
            <div style={{ width: '800px' }}><canvas id="team-velocity-graph"></canvas></div>
        </div>
    );
}