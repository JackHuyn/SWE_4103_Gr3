import ContributionsGraph from '@/app/ui/metrics/contributions-graph';
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input';
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart';
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph';
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph';
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input';
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
import '@/app/ui/stylesheets/metrics.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Metrics() {
    const router = useRouter();
    const [groupId, setGroupId] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPopup2Visible, setIsPopup2Visible] = useState(false);
    const [isGitHubDialogVisible, setIsGitHubDialogVisible] = useState(false);

    function openJoyRatingDialog() {
        setIsPopupVisible(true);
    }

    function openTeamVelocityDialog() {
        setIsPopup2Visible(true);
    }

    function closeDialogs() {
        setIsPopupVisible(false);
        setIsPopup2Visible(false);
    }

    // Close dialog only if click is on backdrop
    function handleBackdropClick(event) {
        if (event.target.id === 'metrics-dialog-backdrop') {
            closeDialogs();
        }
    }

    useEffect(() => {

        
        async function checkSessionAndFetchData() {
          const localId = Cookies.get('localId');
          const idToken = Cookies.get('idToken');
    
          // Validate session
          const sessionResponse = await fetch(`http://127.0.0.1:3001/auth/validate-session?localId=${localId}&idToken=${idToken}`);
          if (sessionResponse.status === 401) {
            // Redirect if unauthorized
            window.location.href = "/auth/login";
            return;
          }
    
          // Fetch data if session is valid
          if (router.isReady) {
            const pathSegments = router.asPath.split('/');
            const lastSegment = pathSegments[pathSegments.length - 1].split('?')[0];
            setGroupId(lastSegment);
            // Add your data-fetching logic here
          }
        }
    
        checkSessionAndFetchData();
      }, [router.isReady, router.asPath]);


    

    return (
        <div className="metrics-container">
            <div className="metrics-header">
                {groupId ? `${groupId.split('_').pop().toUpperCase()} METRICS` : 'Loading Metrics...'}
            </div>

            <div className="metrics-buttons">
                <button className="metrics-button" onClick={openJoyRatingDialog}>Open Joy Rating Dialog</button>
                <button className="metrics-button" onClick={openTeamVelocityDialog}>Open Team Velocity Dialog</button>
            </div>

            <div className="metrics-content">
                <div className="chart-container"><ContributionsGraph groupId={groupId} /></div>
                <div className="chart-container"><JoyAvgChart groupId={groupId} /></div>
                <div className="chart-container"><JoyStudentRatingGraph groupId={groupId} /></div>
                <div className="chart-container"><TeamVelocityGraph groupId={groupId} /></div>
            
            </div>

            {(isPopupVisible || isPopup2Visible) && (
                <div
                    id="metrics-dialog-backdrop"
                    onClick={handleBackdropClick}
                    aria-hidden={!isPopupVisible && !isPopup2Visible}
                >
                    {isPopupVisible && (
                        <div id="joy-rating-dialog" className="dialog">
                            <h2>Joy Rating Input</h2>
                            <JoyRatingInput />
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                    {isPopup2Visible && (
                        <div id="team-velocity-dialog" className="dialog">
                            <h2>Team Velocity Input</h2>
                            <TeamVelocityInput />
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
