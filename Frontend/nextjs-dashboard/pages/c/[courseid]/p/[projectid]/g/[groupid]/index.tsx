import ContributionsGraph from '@/app/ui/metrics/contributions-graph';
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input';
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart';
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph';
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph';
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input';
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
import '@/app/ui/stylesheets/joyRatingInput.css'

import Link from 'next/link';

import '@/app/ui/stylesheets/metrics.css';
import '@/app/ui/stylesheets/homelogout.css'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Metrics() {
    const router = useRouter();
    const [groupId, setGroupId] = useState(null);
    const [isJoyRatingDialogVisible, setIsJoyRatingDialogVisible] = useState(false);
    const [isTeamVelocityDialogVisible, setIsTeamVelocityDialogVisible] = useState(false);
    const [selectedGraphType, setSelectedGraphType] = useState('team'); // State for dropdown selection
    const [username, setUsername] = useState('');
    const [userRole, setUserRole] = useState('');


    // Close dialog only if click is on backdrop
    function handleBackdropClick(event) {
        if (event.target.id === 'metrics-dialog-backdrop') {
            closeDialogs();
        }
    }

    useEffect(() => {
        if (router.isReady) {
            const group_id = router.query.groupid;
            setGroupId(group_id);
            console.log('Group ID:', group_id);
            fetchUsername(group_id);
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (username) {
            console.log('Fetched GitHub Username:', username);
        }
    }, [username]);

    async function fetchUsername(group_id) {
        const localId = Cookies.get('localId');
        try {
            const response = await fetch(
                `http://127.0.0.1:3001/metrics/contributions?localId=${localId}&groupId=${group_id}`,
                {
                    method: 'GET',
                }
            );
            const data = await response.json();
            if (data.approved) {
                setUsername(data.active_user);
                const role_response = await fetch('http://localhost:3001/check-instructor?localId=' + localId)

                    //check if instructor role ? If not show student display
                    if (!role_response.ok) {
                        setUserRole('0')
                    }
                    else {
                        //fetching same for instructor
                        setUserRole('1')
                    }
                    console.log(userRole);
            } else {
                
                console.error('WHY THE FKCUK IS IT NOT WROKING', data);
            }
        } catch (error) {
            console.error('Error fetching username:', error);
        }
    }

    useEffect(() => {
        async function handleOAuthRedirect() {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
    
            if (code) {
                try {
                    const localId = Cookies.get('localId');
                    const response = await fetch(
                        `http://127.0.0.1:3001/auth/github-code-request?localId=${localId}&code=${code}`,
                        { method: 'POST' }
                    );
    
                    const data = await response.json();
                    if (data.approved) {
                        console.log('GitHub authorization successful.');
                    } else {
                        console.error('GitHub authorization failed:', data.reason);
                    }
                } catch (error) {
                    console.error('Error handling GitHub OAuth redirect:', error);
                }
            }
        }
    
        handleOAuthRedirect();
    }, []);
    

    async function checkSessionAndFetchData() {
        const localId = Cookies.get('localId');
        const idToken = Cookies.get('idToken');

        // // Validate session
        // const sessionResponse = await fetch(`http://127.0.0.1:3001/auth/validate-session?localId=${localId}&idToken=${idToken}`);
        // if (sessionResponse.status === 401) {
        // // Redirect if unauthorized
        // window.location.href = "/auth/login";
        // return;
        // }
    }

    function openJoyRatingDialog() {
        setIsJoyRatingDialogVisible(true);
    }

    function openTeamVelocityDialog() {
        setIsTeamVelocityDialogVisible(true);
    }

    function closeDialogs() {
        setIsJoyRatingDialogVisible(false);
        setIsTeamVelocityDialogVisible(false);
    }

    // Dropdown change handler
    const handleGraphTypeChange = (event) => {
        setSelectedGraphType(event.target.value);
    };
    const handleLogout = async () => {
        const localId = Cookies.get('localId')
        if (localId) {
          Cookies.remove('localId');
          Cookies.remove('idToken');
          window.location.href = "/auth/login";
        } else {
          alert("You are already logged out.");
        }
      }

      return (
        <div className="metrics-container">
            <div className="button-bar">
                <div className="left-buttons">
                    <Link href="/">
                        <button id="home">Home</button>
                    </Link>
                    <button id="logout" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
                
            </div>
            <div className="group-id">
                    {groupId ? `${groupId.split('_').pop().toUpperCase()} METRICS` : 'Loading Metrics...'}
                </div>
                

            <div className="metrics-controls">
            <div className="right-buttons">
                    <button className="metrics-button" onClick={() => setIsJoyRatingDialogVisible(true)}>
                        Joy Rating Input
                    </button>
                    <button className="metrics-button" onClick={() => setIsTeamVelocityDialogVisible(true)}>
                        Team Velocity Input
                    </button>
                </div>
                
                <select
                    className="metrics-dropdown"
                    value={selectedGraphType}
                    onChange={(e) => setSelectedGraphType(e.target.value)}
                >
                    <option value="team">Team Metrics</option>
                    <option value="individual">Individual Metrics</option>
                </select>
            </div>

            <div className="metrics-content">
                {selectedGraphType === 'team' ? (
                    <>
                        <div className="chart-container">
                            <ContributionsGraph group_id={groupId} />
                        </div>
                        <div className="chart-container">
                            <TeamVelocityGraph group_id={groupId} />
                        </div>
                        <div className="chart-container">
                            <JoyAvgChart group_id={groupId} />
                        </div>
                        {userRole=='1' && <div className="chart-container">
                            <JoyStudentRatingGraph group_id={groupId} />
                        </div>}
                    </>
                ) : (
                    <>
                        <div className="chart-container">
                            
                            <ContributionsGraph group_id={groupId} username={username} />
                        </div>
                    </>
                )}
            </div>

            {(isJoyRatingDialogVisible || isTeamVelocityDialogVisible) && (
                <div
                    id="metrics-dialog-backdrop"
                    onClick={(e) => e.target.id === 'metrics-dialog-backdrop' && setIsJoyRatingDialogVisible(false)}
                >
                    {isJoyRatingDialogVisible && (
                        <div id="joy-rating-dialog" className="dialog">
                            <h2>Joy Rating Input</h2>
                            <JoyRatingInput closeDialogs={() => setIsJoyRatingDialogVisible(false)} />
                            <button onClick={() => setIsJoyRatingDialogVisible(false)}>Close</button>
                        </div>
                    )}
                    {isTeamVelocityDialogVisible && (
                        <div id="team-velocity-dialog" className="dialog">
                            <h2>Team Velocity Input</h2>
                            <TeamVelocityInput closeDialogs={() => setIsTeamVelocityDialogVisible(false)} />
                            <button onClick={() => setIsTeamVelocityDialogVisible(false)}>Close</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}