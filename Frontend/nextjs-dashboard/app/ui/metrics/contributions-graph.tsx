import Chart from 'chart.js/auto';
import { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import GitHubAppAuthorizationDialog from './github-app-authorization-dialog';
import Loading from '@/app/ui/Loading.tsx';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/contributions-graph.css';

export default function ContributionsGraph({ group_id, username }) {
    console.log('CONTRIBUTIONS GROUP ID RECEIVED: ' + group_id);

    const [authDialog, showAuthDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const commitChartRef = useRef(null);
    const additionsChartRef = useRef(null);
    const deletionsChartRef = useRef(null);

    const destroyExistingCharts = () => {
        if (commitChartRef.current) {
            commitChartRef.current.destroy();
            commitChartRef.current = null;
        }
        if (additionsChartRef.current) {
            additionsChartRef.current.destroy();
            additionsChartRef.current = null;
        }
        if (deletionsChartRef.current) {
            deletionsChartRef.current.destroy();
            deletionsChartRef.current = null;
        }
    };

    useEffect(() => {
        if (group_id) {
            const local_id = Cookies.get('localId');

            fetch(
                `http://127.0.0.1:3001/metrics/contributions?localId=${local_id}&groupId=${group_id}`,
                { method: 'GET' }
            )
                .then((response) => {
                    if (!response.ok) {
                        console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
                        if (response.status === 404) {
                            return { text: 'Server not found!', status: 'danger' };
                        }
                        if (response.status === 498) {
                            // GitHub Authentication Error
                            showAuthDialog(true);
                            return { text: 'GitHub Authentication Error', status: 'danger' };
                        }
                        // Handle non-JSON error responses
                        return response.text().then((text) => ({
                            text,
                            status: 'danger',
                            isJson: false, // Mark as non-JSON
                        }));
                    }
                    return response.text().then((text) => ({
                        text,
                        status: 'success',
                        isJson: true, // Mark as JSON
                    }));
                })
                .then((resp) => {
                    try {
                        // If the response is not JSON, log it and stop processing
                        if (!resp.isJson) {
                            console.error('Non-JSON response:', resp.text);
                            setLoading(false);
                            return;
                        }
    
                        const r = JSON.parse(resp.text);
    
                        if (!r['approved']) {
                            console.error('Backend Response Not Approved:', r);
                            throw new Error('Response not approved');
                        }
    
                        console.log('Backend Response:', r);
    
                        const contributions = r['contributions'];
                        const filteredContributions = username
                            ? contributions.filter((contribution) => contribution.author === username)
                            : contributions;
    
                        if (filteredContributions.length === 0) {
                            console.warn(`No contributions found for user: ${username}`);
                            setLoading(false);
                            return;
                        }

                        console.log('Filtered Contributions:', filteredContributions);

                        const weeks = filteredContributions[0]?.contributions.map((row) =>
                            row.week.split(' ')[0]
                        );

                        let commit_graph_data = [];
                        let additions_graph_data = [];
                        let deletions_graph_data = [];

                        for (const contribution of filteredContributions) {
                            commit_graph_data.push({
                                label: contribution.author,
                                data: contribution.contributions.map((row) => row.commits),
                            });
                            additions_graph_data.push({
                                label: contribution.author,
                                data: contribution.contributions.map((row) => row.additions),
                            });
                            deletions_graph_data.push({
                                label: contribution.author,
                                data: contribution.contributions.map((row) => row.deletions),
                            });
                        }

                        destroyExistingCharts();

                        commitChartRef.current = new Chart(document.getElementById('commits'), {
                            type: 'line',
                            data: {
                                labels: weeks,
                                datasets: commit_graph_data,
                            },
                        });

                        additionsChartRef.current = new Chart(document.getElementById('additions'), {
                            type: 'line',
                            data: {
                                labels: weeks,
                                datasets: additions_graph_data,
                            },
                        });

                        deletionsChartRef.current = new Chart(document.getElementById('deletions'), {
                            type: 'line',
                            data: {
                                labels: weeks,
                                datasets: deletions_graph_data,
                            },
                        });

                        setLoading(false);
                    } catch (err) {
                        console.error('Error processing contributions:', err);
                    }
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                })
                .finally(() => {
                    setLoading(false); // Set loading to false after charts are ready
                });
        }
    }, [group_id, username]);

    return (
        <>
            {loading && <Loading />}
                                {authDialog && <GitHubAppAuthorizationDialog />}

            <div id="charts">
                <div className="graph">
                    {!loading && <h3>Commits</h3>}
                    <div style={{ width: '100%' }}>
                        <canvas id="commits"></canvas>
                    </div>
                </div>
                <div className="graph">
                    {!loading && <h3>Additions</h3>}
                    <div style={{ width: '100%' }}>
                        <canvas id="additions"></canvas>
                    </div>
                </div>
                <div className="graph">
                    {!loading && <h3>Deletions</h3>}
                    <div style={{ width: '100%' }}>
                        <canvas id="deletions"></canvas>
                    </div>
                </div>
            </div>
        </>
    );
}
