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
import HandleLogout from '@/app/ui/logout';
import { group } from 'console';

export default function Metrics() {
    const router = useRouter();
    const [groupId, setGroupId] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPopup2Visible, setIsPopup2Visible] = useState(false);
    const [isGitHubDialogVisible, setIsGitHubDialogVisible] = useState(false);
    const [isScrumMaster, setIsScrumMaster] = useState(false)
    const [userRole, setUserRole] = useState('')
    const [isRoleLoaded, setIsRoleLoaded] = useState(false);

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
        
        if (router.isReady) {

            const group_id = router.query.groupid;
            setGroupId(group_id);
            
            console.log("Group ID:", group_id);
            
        }

       

    }, [router.isReady, router.query]);

    useEffect(() => {
        if (groupId) {
          checkSessionAndFetchData();
        }
      }, [groupId]);

        
    async function checkSessionAndFetchData() {
        const localId = Cookies.get('localId');
        const idToken = Cookies.get('idToken');

        const role_response = await fetch('http://localhost:3001/check-instructor?localId=' + localId)

        const role_data = await role_response.json()
            //check if instructor role ? If not show student display
            if(!role_data.approved){
              setUserRole('0')
            }
            else {
              //fetching same for instructor
              setUserRole('1')
            }


        //check if Scrum Master: 
        const scrum_master_response = await fetch('http://localhost:3001/check-scrum-master?groupId=' + groupId + '&localId=' + localId)

        const data = await scrum_master_response.json()
        
        if(data.approved){
            console.log('User is a scrum master')
            setIsScrumMaster(true)
            
        }

        else{
            console.log('User is not a scrum master')
            setIsScrumMaster(false)
        }

        setIsRoleLoaded(true)

        // // Validate session
        // const sessionResponse = await fetch(`http://127.0.0.1:3001/auth/validate-session?localId=${localId}&idToken=${idToken}`);
        // if (sessionResponse.status === 401) {
        // // Redirect if unauthorized
        // window.location.href = "/auth/login";
        // return;
        // }
    }

    return (

       /**  {isScrumMaster && 
            (<button className="metrics-button" onClick={openTeamVelocityDialog}>Open Team Velocity Dialog</button>)
        }**/
        <div className="metrics-container">
            <div className="metrics-header">
                {groupId ? `${groupId.split('_').pop().toUpperCase()} METRICS` : 'Loading Metrics...'}
            </div>

            <button id="logout" onClick={HandleLogout}>Log Out</button>
            {isRoleLoaded && (
            <div className="metrics-buttons">

                    {/* Check if student  */}
                    {userRole === '0' && (
                    <>
                           <button className="metrics-button" onClick={openJoyRatingDialog}>Open Joy Rating Dialog</button>
                           {/* Check if scrum master  */}
                           {isScrumMaster && 
                            (<button className="metrics-button" onClick={openTeamVelocityDialog}>Open Team Velocity Dialog</button>)}
                    </>
                    )}


                    
                    {/* Add checks once surveys are ready  */}
                    <button className="metrics-button">Survey//soon</button>
            
            </div>

            )}

            <div className="metrics-content">
                <div className="chart-container"><ContributionsGraph group_id={groupId} /></div>
                <div className="chart-container"><JoyAvgChart group_id={groupId} /></div>
                <div className="chart-container"><JoyStudentRatingGraph group_id={groupId} /></div>
                <div className="chart-container"><TeamVelocityGraph group_id={groupId} /></div>
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
                            <JoyRatingInput closeDialogs={closeDialogs}/>
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                    {isPopup2Visible &&  (
                        <div id="team-velocity-dialog" className="dialog">
                            <h2>Team Velocity Input</h2>
                            <TeamVelocityInput closeDialogs={closeDialogs}/>
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


