import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import Link from 'next/link';
import HandleLogout from '@/app/ui/logout';
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';
import '@/app/ui/stylesheets/groups.css';
import '@/app/ui/stylesheets/coursePage.css';
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
  const [courseid, setCourseId] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isaddGroupVisible, setIsAddGroupVisible] = useState(false);// Stores true or false depending on if the popup is visible
  const [isRemoveGroupVisible, setIsRemoveGroupVisible] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [removedGroups, setRemovedGroups] = useState([]);
  const [groupData, setgroupData] = useState([]);
  const [userRole, setUserRole] = useState('')  
  const [loading,setLoading] = useState(true) // Loading state
  const inputRef = useRef(null); // Create a ref for the input field
  const [nGroups, setNGroups] = useState("1");
  

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
            if(data.approved) {
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

//------------------- Add Group -------------------
//Function: set visibiliy of addGroup popup
const addGroup = () =>{
  setIsAddGroupVisible(true);
};
//Function: handle add group
const handleAddGroup = async () => {
  //console.log("The number found is : ", nGroups)  
  //return          
  //Ensure localId cookie is valid
  const localId  = Cookies.get('localId')  
  if (!localId){
    window.location.href = "/auth/login"
  }
  const groupData = {              
    project_id: projectid,
    n_groups: nGroups
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
//-------------------------------------------------
//------------------ Remove Group -----------------
//Function: set visibiliy of removeGroups popup
const removeGroups = () =>{
  setIsRemoveGroupVisible(true);
};
//Function: handle checkbox change
const handleCheckboxChange = (groupId) => {
  setSelectedGroups((prevSelected) => {
      if (prevSelected.includes(groupId)) {
          return prevSelected.filter((id) => id !== groupId);
      } else {
          return [...prevSelected, groupId];
      }
  });
};
//Function: handle remove groups
const handleRemoveGroups = async () => {
  const localId  = Cookies.get('localId')
  if (!localId){
      window.location.href = "/auth/login"
  }
  const groupsToRemove = groupDetails?.groups?.filter(group => selectedGroups.includes(group.group_id));
  setRemovedGroups(groupsToRemove); // Store removed groups in the state
  setSelectedGroups([]); // Clear the selected groups after removal
  const removedList = {
      remove_list: groupsToRemove
  };
  try { 
      const response = await fetch('http://localhost:3001/remove-groups' , {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(removedList),
      });
      const result = await response.json();
      if (response.ok) {
          window.location.reload();
          alert('removed successfully!');
          window.location.reload();
      } else {
          alert(`Error removing groups: ${result.reason}`);
      }
  } catch (error) {
  console.error('Error sending request:', error);
  alert('Error removing group. Please try again later.');
  }
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

const handleChangeNumber = (event) => {
  const value = event.target.value;

  setNGroups(value)
  
};


//-------------------------------------------------

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
        {projectid && <h1 style={{textAlign:"center"}}>{projectid.split('_').slice(1).join('_')}</h1>}
        {/* <p>{JSON.stringify(courseDetails, null, 2)}</p> */}
        {/*<p>{courseDetails.courses.section} | {courseDetails.courses.term}</p>*/}
      </div>
      <div className="content-grid">
        {/* Groups Section */}
        <div className="projects-section full-width-section">
          <div className="section-header">
            <h2>Groups</h2>
            {userRole === '1' && (
              <div className="options-container">
                <button className="options-button">⋮</button>
                <div className="options-menu">
                  <a onClick={addGroup}>Add Group</a>
                  <a onClick={removeGroups}>Remove Group</a>
                  <a >Group Mambers//</a>
                  <a >Set Scrum Masters//</a>
                </div>
              </div>
            )}
          </div>
          <div className="projects-grid" >
            {groupDetails?.groups?.map((groups, index) => (
              <Link href={{
                pathname: '/c/[course_slug]/p/[project_slug]/g/[group_slug]',
                query: {course_slug: courseid, project_slug: projectid, group_slug: groups.group_id
              }}}> 
                <div key={index} className="project-card">
                  {groups.group_name}
                </div>
              </Link>
            ))}
          </div>
          <p className="view-all">View all</p>
        </div>
      </div>
      {/* Add group popup */}
      {isaddGroupVisible && (
        <div className="popup">
          <div className="popup_content">
            <h2>Add New Group</h2>
            <p>Select the number of groups to add</p>
            <div className="popup_buttons">

            <select
        className="number-select"
        //value = {nGroups}
        onChange={handleChangeNumber}
        //style={{ padding: "5px" }}
      >
        
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      

            
              <Button className="popup_button" onClick={handleAddGroup}>
                  Add
              </Button>
              <Button className="popup_button cancel_button" onClick={() => setIsAddGroupVisible(false)}>
                  Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/*Handle remove student*/}
      {isRemoveGroupVisible && (
        <div className="popup">
          <div className="popup_content">
            <h2>Select Group to Remove</h2>
            <div className="checkbox-list">
              <div className="checkbox-header">
                <div className="header-item">Group Name</div>
                <div className="header-item">To Remove</div>
              </div>
              {groupDetails?.groups?.map((group, index) => (
                <div className="checkbox-item" key={index}>
                  <div className="checkbox-name">
                    {group.group_name}
                  </div>
                  <div className="checkbox-column">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        onChange={() => handleCheckboxChange(group.group_id)}
                        checked={selectedGroups.includes(group.group_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="popup_buttons">
              <Button className="popup_button" onClick={handleRemoveGroups}>
                  Remove
              </Button>
              <Button className="popup_button cancel_button" onClick={() => setIsRemoveGroupVisible(false)}>
                  Cancel
              </Button>
            </div>
          </div>
        </div>
      )}          
  
        
    </div> 
  );  
}