import ContributionsGraph from '@/app/ui/metrics/contributions-graph';
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input';
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart';
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph';
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph';
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input';
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
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


    // Close dialog only if click is on backdrop
    function handleBackdropClick(event) {
        if (event.target.id === 'metrics-dialog-backdrop') {
            closeDialogs();
        }
    }

    useEffect(() => {
        checkSessionAndFetchData();
        if (router.isReady) {
            const group_id = router.query.groupid;
            setGroupId(group_id);
            console.log("Group ID:", group_id);
            const githubUsername = Cookies.get('githubUsername');
            if (githubUsername) {
                setUsername(githubUsername);
            } else {
                console.log("No GitHub username found in cookies.");
            }
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (username) {
            console.log("Fetched GitHub Username:", username);
        }
    }, [username]);

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
                        <div className="chart-container">
                            <JoyStudentRatingGraph group_id={groupId} />
                        </div>
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