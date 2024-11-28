import ContributionsGraph from '@/app/ui/metrics/contributions-graph';
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input';
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart';
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph';
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph';
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input';
import Survey10point from '@/app/ui/metrics/survey-10-point';
import SurveyCEAB from '@/app/ui/metrics/survey-ceab';
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
import '@/app/ui/stylesheets/metrics.css';
import '@/app/ui/stylesheets/coursePage.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import HandleLogout from '@/app/ui/logout';
import '@/app/ui/stylesheets/popup.css';
import '@/app/ui/stylesheets/courseDetails.css';
import { group } from 'console';

export default function Metrics() {
    const router = useRouter();
    const localId = Cookies.get('localId');
    const [groupId, setGroupId] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPopup2Visible, setIsPopup2Visible] = useState(false);
    const [isGithubDialogVisible, setIsGithubDialogVisible] = useState(false);
    const [isScrumMaster, setIsScrumMaster] = useState(false)
    const [userRole, setUserRole] = useState('')
    const [isRoleLoaded, setIsRoleLoaded] = useState(false);
    const [githubRepo, setGithubRepo] = useState(''); // Store the new course name
    const [isSurveyPopupVisible, setIsSurveyPopupVisible] = useState(false);
    const [isCEABPopupVisible, setIsCEABPopupVisible] = useState(false);
    const [studentList, setStudentList] = useState([]);

    function openAddGithubRepoDialog(){
        setIsGithubDialogVisible(true);
    }

    function openJoyRatingDialog() {
        setIsPopupVisible(true);
    }

    function survey() {
        setIsSurveyPopupVisible(true);
    }

    function ceab() {
        setIsCEABPopupVisible(true);
    }

    function openTeamVelocityDialog() {
        setIsPopup2Visible(true);
    }

    function closeDialogs() {
        setIsPopupVisible(false);
        setIsPopup2Visible(false);
        setIsGithubDialogVisible(false);
        setIsSurveyPopupVisible(false);
        setIsCEABPopupVisible(false);
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
    }


    async function submitGithubRepo(){

        if(githubRepo)
        {
            console.log(githubRepo)

            const response = await fetch('http://localhost:3001//add-github-repo?groupId=' + groupId + '&githubRepo=' + githubRepo)

            const data = await response.json()

            if(data.approved){

                console.log('The github repository has been added')
                window.location.reload();

            }

            else{

                console.log('The github repository could not be added')

            }

            closeDialogs()


        }

        else{
            alert('please enter a repository')
        }
    }

    return (

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
                           <button className="metrics-button" onClick={survey}>10 points Survey</button>
                           <button className="metrics-button" onClick={ceab}>CEAB Survey</button>
                           {/* Check if scrum master  */}
                           {isScrumMaster && 
                            (
                                <>
                                <button className="metrics-button" onClick={openTeamVelocityDialog}>Open Team Velocity Dialog</button>
                                <button className="metrics-button" onClick={openAddGithubRepoDialog}>Add Github Repo</button>
                                </>
                            )}
                            
                    </>
                    )}


                    
                    {/* Add checks once surveys are ready  */}
            
            </div>

            )}

            <div className="metrics-content">
                <div className="chart-container"><ContributionsGraph group_id={groupId} /></div>
                <div className="chart-container"><JoyAvgChart group_id={groupId} /></div>
                <div className="chart-container"><JoyStudentRatingGraph group_id={groupId} /></div>
                <div className="chart-container"><TeamVelocityGraph group_id={groupId} /></div>
            </div>

            {(isPopupVisible || isPopup2Visible || isGithubDialogVisible || isSurveyPopupVisible || isCEABPopupVisible) && (
                <div
                    id="metrics-dialog-backdrop"
                    onClick={handleBackdropClick}
                    aria-hidden={!isPopupVisible && !isPopup2Visible && !isSurveyPopupVisible && !isCEABPopupVisible}
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
                    {isSurveyPopupVisible &&  (
                        <div id="joy-rating-dialog" className="dialog">
                            <h2>10 point Survey</h2>
                            <Survey10point closeDialogs={closeDialogs}/>
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                    {isCEABPopupVisible &&  (
                        <div id="joy-rating-dialog" className="dialog">
                            <h2>CEAB Survey</h2>
                            <SurveyCEAB closeDialogs={closeDialogs}/>
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                    {isGithubDialogVisible &&  (

                            <div id="addGithub-dialog">
                                <h1>Add Github Repo</h1>
                                 
                                <div>
                                    <h2>add</h2>
                                <input className='github-input'
                                //ref={inputRef} // Attach the ref to the input field
                                type="text"
                                //value={newCourseName}
                                onChange={(e) => setGithubRepo(e.target.value)}
                                placeholder="Add the name of your github repository "
                                />
                                </div>

                                <button id="github-button" onClick={submitGithubRepo}>Submit</button>

                            </div>
                          
                    )}
                </div>
            )}
        </div>
    );
}


