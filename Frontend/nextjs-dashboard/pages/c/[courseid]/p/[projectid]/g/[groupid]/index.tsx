import ContributionsGraph from '@/app/ui/metrics/contributions-graph';
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input';
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart';
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph';
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph';
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input';
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
import '@/app/ui/stylesheets/metrics.css';
import '@/app/ui/stylesheets/coursePage.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import HandleLogout from '@/app/ui/logout';
import { group } from 'console';

export default function Metrics() {
    const router = useRouter();
    const [groupId, setGroupId] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPopup2Visible, setIsPopup2Visible] = useState(false);
    const [isGithubDialogVisible, setIsGithubDialogVisible] = useState(false);
    const [isScrumMaster, setIsScrumMaster] = useState(false)
    const [userRole, setUserRole] = useState('')
    const [isRoleLoaded, setIsRoleLoaded] = useState(false);
    const [githubRepo, setGithubRepo] = useState(''); // Store the new course name
    const [isSurveyPopupVisible, setIsSurveyPopupVisible] = useState(false);


    function openAddGithubRepoDialog(){
        setIsGithubDialogVisible(true);
    }

    function openJoyRatingDialog() {
        setIsPopupVisible(true);
    }

    function openTeamVelocityDialog() {
        setIsPopup2Visible(true);
    }

    function closeDialogs() {
        setIsPopupVisible(false);
        setIsPopup2Visible(false);
        setIsGithubDialogVisible(false);
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

//------------------ Remove Project -------------------
const survey = () =>{
    setIsSurveyPopupVisible(true);
};
const handleRemoveProject = async () => {
    if (newProjectName) {
        const localId  = Cookies.get('localId')
        if (!localId){
            window.location.href = "/auth/login"
        }
        const projectData = {
            course_id: courseid,
            project_name: newProjectName
        };
        try {
            const response = await fetch('http://localhost:3001/remove-project' , {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify(projectData),  // Send JSON data in request body
            });
            const result = await response.json();
            if (response.ok) {
                alert('Project removed successfully!');
                window.location.reload();
                setNewProjectName('');
                setIsProjectPopup2Visible(false);
            } else {
                alert(`Error removing project: ${result.reason}`);
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Error removing project. Please try again later.');
        }
    } else {
        alert('Please fill in all the fields.');
    }
};
//-----------------------------------------------------
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
                    <Button className="add-button" onClick={survey}> Survey </Button>
            
            </div>

            )}

            <div className="metrics-content">
                <div className="chart-container"><ContributionsGraph group_id={groupId} /></div>
                <div className="chart-container"><JoyAvgChart group_id={groupId} /></div>
                <div className="chart-container"><JoyStudentRatingGraph group_id={groupId} /></div>
                <div className="chart-container"><TeamVelocityGraph group_id={groupId} /></div>
            </div>

            {(isPopupVisible || isPopup2Visible || isGithubDialogVisible) && (
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
                    {/*Handle survey*/}
                    {isSurveyPopupVisible && (
                        <div className="popup">
                            <div className="popup_content">
                                <h2>Survey</h2>
            <div className="checkbox-list">
              <div className="checkbox-header">
                <div className="header-item">Group Name</div>
                <div className="header-item">To Remove</div>
              </div>
              
            </div>
            <div className="popup_buttons">
              <Button className="popup_button" >
                  Ok
              </Button>
              <Button className="popup_button cancel_button" onClick={() => setIsSurveyPopupVisible(false)}>
                  Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
                </div>
            )}
        </div>
    );
}


