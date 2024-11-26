import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
//import { Button } from './button';
import Cookies from 'js-cookie';
import Link from 'next/link';
import FileUpload from '@/app/ui/upload-form'
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';
import '@/app/ui/stylesheets/homelogout.css'
import { group } from 'console';


/**
 * This function displays details of specific projects
 * 
 * Instructor = > Currently it only show the groups associated with this project
 * Student => Implementation only sees their group TBD
 * @param 
 * @returns 
 */
export default function ProjectDetails(){

    const searchParams = useSearchParams();
    const router = useRouter();
    const { projectid } = router.query;
    const [groupDetails, setGroupDetails] = useState(null);
    const localId = Cookies.get('localId');
    const [isGroupPopupVisible, setIsGroupPopupVisible] = useState(false);
    const [courseid, setCourseId] = useState(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [isaddGroupVisible, setIsAddGroupVisible] = useState(false);// Stores true or false depending on if the popup is visible
    const [userRole, setUserRole] = useState('')
    
    const [loading,setLoading] = useState(true) // Loading state


    useEffect(() => {

        setCourseId(router.query.courseid)
        
        if (localId && projectid) {
          const fetchData = async () => {


            try{
              if(localId) {

                const role_response = await fetch('http://localhost:3001/check-instructor?localId=' + localId)

                //check if instructor role ? If not show student display
                if(!role_response.ok){
                    setUserRole('0')
                }
                else {
                    //fetching same for instructor
                    setUserRole('1')
                }

                const res = await fetch(
                  `http://localhost:3001/show_groups?localId=${localId}&projectId=${projectid}`
                )
        
                if (!res.ok) {
                  throw new Error('Failed to fetch data');
                }
        
                const data = await res.json();
                if(data.approved)
                {
                    setGroupDetails(data);
                }

              }

              else  {
                window.location.href = "/auth/login"
              }

            }

           

            catch (error) {
              console.error('Error fetching Groups:', error);
              setError('Error loading Groups. Please try again later.');
            }
            finally{
              setLoading(false);
            }
            
            ///setStudentList(data.courses.student_ids)
            //console.log(data)

    
          };
    
          fetchData();
        }
        
      }, [localId, projectid]);


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

      const handleAddGroup = async () => {
            
            //Ensure localId cookie is valid
            const localId  = Cookies.get('localId')
    
            if (!localId){
                window.location.href = "/auth/login"
            }
            const groupData = {
                
                project_id: projectid,
                
                
                
            };
    
            try {
                
                //Need to have checks to ensure that the instructor is valid 
                const response = await fetch('http://localhost:3001/add-group' , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        
                    },
                    body: JSON.stringify(groupData),  // Send JSON data in request body
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    window.location.reload();
                    alert('group added successfully!');
                    window.location.reload();
                    
                } else {
                    alert(`Error adding group: ${result.reason}`);
                }
            } catch (error) {
                console.error('Error sending request:', error);
                alert('Error adding group. Please try again later.');
            }
    
         
    };


    return (
      <div className="page-wrapper">
        <div className="button-bar">
          {/* Home Button on the Left */}
          <Link href="/">
            <button id="home">Home</button>
          </Link>

          {/* Logout Button on the Right */}
          <button id="logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
  
        <div className="course-header">
          <h1>{projectid?.split('_').slice(1).join(' ')}</h1>
        </div>
  
        <div className="content-grid-group">
          <div className="projects-section">
            <div className="section-header">
              <h2>Groups</h2>
              {userRole === '1' && (
                <button className="add-button" onClick={() => setIsAddGroupVisible(true)}>
                  +
                </button>
              )}
            </div>
  
            <div className="projects-grid">
              {groupDetails?.groups?.map((group, index) => (
                <Link
                  key={index}
                  href={{
                    pathname: '/c/[course_slug]/p/[project_slug]/g/[group_slug]',
                    query: { course_slug: courseid, project_slug: projectid, group_slug: group.group_id }
                  }}
                >
                  <div className="project-card">{group.group_name}</div>
                </Link>
              ))}
            </div>
            <p className="view-all">View all</p>
          </div>
        </div>
  
        {isaddGroupVisible && (
          <div className="popup">
            <div className="popup_content">
              <h2>Add New Group</h2>
              <div className="popup_buttons">
                <button className="popup_button" onClick={handleAddGroup}>
                  Add Group
                </button>
                <button
                  className="popup_button cancel_button"
                  onClick={() => setIsAddGroupVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
    
}