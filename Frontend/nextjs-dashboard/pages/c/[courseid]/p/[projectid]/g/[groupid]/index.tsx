import ContributionsGraph from '@/app/ui/metrics/contributions-graph';
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input';
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart';
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph';
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph';
import TeamVelocityInput from '@/app/ui/metrics/team-velocity-input';
import TruckFactorInput from '@/app/ui/metrics/truck-factor-input';
import TruckFactorStatBarItem from '@/app/ui/metrics/truck-factor-stat-bar';
import GitHubAppAuthorizationDialog from '@/app/ui/metrics/github-app-authorization-dialog'
import PersonalJoyChart from '@/app/ui/metrics/personal-joy-graph';
import '@/app/ui/stylesheets/joyRatingInput.css'

import Link from 'next/link';

import '@/app/ui/stylesheets/metrics.css';
import '@/app/ui/stylesheets/coursePage.css';
import '@/app/ui/stylesheets/homelogout.css'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import HandleLogout from '@/app/ui/logout';
import MoonLight from '@/app/ui/logo_module';
import { group } from 'console';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Metrics() {
    const router = useRouter();
    const [groupId, setGroupId] = useState(null);
    const [isTruckFactorInputVisible, setIsTruckFactorInputVisible] = useState(false)
    const [isJoyRatingDialogVisible, setIsJoyRatingDialogVisible] = useState(false)
    const [isTeamVelocityDialogVisible, setIsTeamVelocityDialogVisible] = useState(false);
    const [selectedGraphType, setSelectedGraphType] = useState('team'); // State for dropdown selection
    const [username, setUsername] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isGithubDialogVisible, setIsGithubDialogVisible] = useState(false);
    const [isScrumMaster, setIsScrumMaster] = useState(false)
    const [isRoleLoaded, setIsRoleLoaded] = useState(false);
    const [githubRepo, setGithubRepo] = useState(''); // Store the new course name

    function openAddGithubRepoDialog(){
        setIsGithubDialogVisible(true);
    }


    // Close dialog only if click is on backdrop
    function handleBackdropClick(event) {
        console.log('hello there :/ ')
        if (event.target.id === 'metrics-dialog-backdrop') {
            console.log('it is here for sure ')
            closeDialogs();
        }
    }

    useEffect(() => {
        if (router.isReady) {

            const group_id = router.query.groupid;
            setGroupId(group_id);
            console.log('Group ID:', group_id);
            fetchUsername(group_id);
            // try{
            //     // const graph_type = router.query.graphType
            //     // console.log('GRAPH TYPE: ', graph_type)
            //     // setSelectedGraphType(graph_type)
            // } catch {

            // }
        }

       

    }, [router.isReady, router.query]);

    useEffect(() => {
        if (username) {
            console.log('Fetched GitHub Username:', username);
        }
    }, [username]);

    useEffect(() => {
        if (groupId) {
          checkSessionAndFetchData();
        }
      }, [groupId]);

    // useEffect(() => {
    //     if(selectedGraphType)
    //     {
    //         router.query.graphType = selectedGraphType
    //         // router.push(router)
    //     }
        
    //     console.log('GRAPH TYPE: ', router.query.graphType)
    // }, [selectedGraphType])   
      

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
                
                console.error(data);
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
        const scrum_master_response = await fetch('http://localhost:3001/check-scrum-master?groupId=' + groupId + '&localId=' + localId).catch(
            (error) => {console.log(error)})
        
        try{
            const data = await scrum_master_response.json()
        
            if(data.approved){
                console.log('User is a scrum master')
                setIsScrumMaster(true)
            }
    
            else{
                console.log('User is not a scrum master')
                setIsScrumMaster(false)
            }
        } catch {
            setIsScrumMaster(false)
        }
        

        setIsRoleLoaded(true)
    }

    function openJoyRatingDialog() {
        setIsJoyRatingDialogVisible(true);
    }

    function openTeamVelocityDialog() {
        setIsTeamVelocityDialogVisible(true);
    }
    function openTruckFactorInput() {
        setIsTruckFactorInputVisible(true)
    }

    function closeDialogs() {
        setIsJoyRatingDialogVisible(false);
        setIsTeamVelocityDialogVisible(false);
        setIsTruckFactorInputVisible(false)
        setIsGithubDialogVisible(false)
    }

    // Dropdown change handler
    const handleGraphTypeChange = (event) => {
        setSelectedGraphType(event.target.value);
    };


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
            <div className="button-bar">
                <div className="left-buttons">
                    <Link href="/">
                        {/* <button id="home">Home</button> */}
                        <MoonLight></MoonLight>
                    </Link>
                    <button id="logout" onClick={HandleLogout}>
                        Log Out
                    </button>
                </div>
                
            </div>

            <div className="group-id">
                    {groupId ? `${groupId.split('_').pop().toUpperCase()} METRICS` : 'Loading Metrics...'}
            </div>

            {isRoleLoaded && (
                <div className="metrics-controls">
                <div className="right-buttons">

                    {/* Check if student  */}
                    {userRole === '0' && (
                    <>
                           <button className="metrics-button" onClick={openJoyRatingDialog}>
                            Joy Rating Input
                           </button>
                           <button className="metrics-button" onClick={openTruckFactorInput}>
                            Open Truck Factor Dialog
                            </button>
                           {/* Check if scrum master  */}
                           {isScrumMaster && 
                            (
                                <>
                                <button className="metrics-button" onClick={openTeamVelocityDialog}>
                                Team Velocity Input
                                </button>
                                <button className="metrics-button" onClick={openAddGithubRepoDialog}>Add Github Repo</button>
                                </>
                            )}
                            
                    </>
                    )}
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

            )}

            <div className="metrics-content">
                {selectedGraphType === 'team' ? (
                    <>
                        <div id="stats-bar" className="chart-container">
                            <div className='stats-bar-item'>
                                <TruckFactorStatBarItem />
                            </div>
                        </div>
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
                        <div className='chart-container'>
                            <PersonalJoyChart group_id={groupId} />
                        </div>
                    </>
                )}
            </div>

            {(isJoyRatingDialogVisible || isTeamVelocityDialogVisible || isGithubDialogVisible || isTruckFactorInputVisible) && (
                <div
                    id="metrics-dialog-backdrop"
                    onClick={handleBackdropClick}
                    aria-hidden={!isJoyRatingDialogVisible && !isTeamVelocityDialogVisible && !isGithubDialogVisible && !isTruckFactorInputVisible}
                    
                >
                    {isJoyRatingDialogVisible && (
                        <div id="joy-rating-dialog" className="dialog">
                            <h2>Joy Rating Input</h2>
                            <JoyRatingInput closeDialogs={closeDialogs} />
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                    {isTeamVelocityDialogVisible && (
                        <div id="team-velocity-dialog" className="dialog">
                            <h2>Team Velocity Input</h2>
                            <TeamVelocityInput closeDialogs={closeDialogs} />
                            <button onClick={closeDialogs}>Close</button>
                        </div>
                    )}
                    {isTruckFactorInputVisible && (
                        <div id="truck-factor-dialog" className="dialog">
                            <TruckFactorInput closeDialogs={closeDialogs}/>
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


