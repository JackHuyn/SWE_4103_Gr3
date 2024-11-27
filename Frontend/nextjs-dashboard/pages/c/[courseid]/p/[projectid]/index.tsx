import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import Link from 'next/link';
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';
import '@/app/ui/stylesheets/groups.css';
import { groups } from 'console';


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
  const [isManageGroupVisible, setIsManageGroupVisible] = useState(false);
  const [selectedGroups1, setSelectedGroups1] = useState([]);//for remove group
  const [selectedGroups2, setSelectedGroups2] = useState([]);//for manage student-group
  const [selectedGroups3, setSelectedGroups3] = useState([]);//for set scrum master
  const [removedGroups, setRemovedGroups] = useState([]);
  const [groupData, setgroupData] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [userRole, setUserRole] = useState('')  
  const [loading,setLoading] = useState(true) // Loading state
  const inputRef = useRef(null); // Create a ref for the input field

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
              setStudentList(data.students)
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
  //Ensure localId cookie is valid
  const localId  = Cookies.get('localId')  
  if (!localId){
    window.location.href = "/auth/login"
  }
  const groupData = {              
    project_id: projectid
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
const handleCheckboxChange1 = (groupId) => {
  setSelectedGroups1((prevSelected) => {
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
  const groupsToRemove = groupDetails?.groups?.filter(group => selectedGroups1.includes(group.group_id));
  setRemovedGroups(groupsToRemove); // Store removed groups in the state
  setSelectedGroups1([]); // Clear the selected groups after removal
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
//-------------------------------------------------
//------------------ Manage Group -----------------
//Function: set visibiliy of manageGroup popup
const manageGroups = () =>{
  setIsManageGroupVisible(true);
};
//Function: handle student-group checkbox change
const handleCheckboxChange2 = (studentId, groupId) => {
  setSelectedGroups2((prevSelected) => {
    const newPair = JSON.stringify([studentId, groupId]);
    if (prevSelected.some(pair => JSON.stringify(pair) === newPair)) {
        return prevSelected.filter(pair => JSON.stringify(pair) !== newPair);
    } else {
          return [...prevSelected, [studentId, groupId]];
      }
  });
};
//Function: handle scrum master checkbox change
const handleCheckboxChange3 = (studentId, groupId) => {
  setSelectedGroups3((prevSelected) => {
    const newPair = JSON.stringify([studentId, groupId]);
    if (prevSelected.some(pair => JSON.stringify(pair) === newPair)) {
        return prevSelected.filter(pair => JSON.stringify(pair) !== newPair);
    } else {
          return [...prevSelected, [studentId, groupId]];
      }
  });
};
//Function: handle manage groups
const handleManageGroups = async () => {
  const localId  = Cookies.get('localId')
  if (!localId){
      window.location.href = "/auth/login"
  }
  const manageList = {
      manage_list: selectedGroups2,
      master_list: selectedGroups3
  };
  try { 
      const response = await fetch('http://localhost:3001/manage-groups' , {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(manageList),
      });
      const result = await response.json();
      if (response.ok) {
          window.location.reload();
          alert('managed successfully!');
          window.location.reload();
      } else {
          alert(`Error managing groups: ${result.reason}`);
      }
  } catch (error) {
  console.error('Error sending request:', error);
  alert('Error managing group. Please try again later.');
  }
};
//-------------------------------------------------

  return (
    <div className="page-wrapper">
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
                  <a onClick={manageGroups}>Group Mambers</a>
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
            <div className="popup_buttons">
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
      {/*Handle remove group*/}
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
                        onChange={() => handleCheckboxChange1(group.group_id)}
                        checked={selectedGroups1.includes(group.group_id)}
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
      {/*Handle set students in group*/}
      {isManageGroupVisible && (
        <div className="popup">
        <div className="popup_content">
          <h1>Set Students in Groups</h1>
          <div className="checkbox-list">
            <div className="checkbox-header">
              <div className="header-name">List</div>
              {groupDetails?.groups?.map((group, index) => (
                <div className="header-item">
                  {group.group_name.match(/Group (.*)/)?.[1]||"N/A"}
                </div>
              ))}
            </div>
            {groupDetails?.students?.map((student, index1) => (
                <div className="checkbox-item" key={index1}>
                  <div className="checkbox-name">
                    {student.first_name+" "+student.last_name}
                  </div>
                  {groupDetails?.groups?.map((group, index2) => (
                    <div className="checkbox-column" key={index2}>
                      {/*Manage Student in Group*/}
                      <input
                        type="checkbox"
                        onChange={() => handleCheckboxChange2(student.uid, group.group_id)}
                        checked={selectedGroups2.some(
                          pair => JSON.stringify(pair) === JSON.stringify([student.uid, group.group_id])
                        )}
                      />
                      {/*Set Scrum Master*/}
                      <input
                        type="checkbox"
                        onChange={() => handleCheckboxChange3(student.uid, group.group_id)}
                        checked={selectedGroups3.some(
                          pair => JSON.stringify(pair) === JSON.stringify([student.uid, group.group_id])
                        )}
                      />
                    </div>    
                  ))}
                </div>
              ))}
          </div>
          <div className="popup_buttons">
              <Button className="popup_button" onClick={handleManageGroups}>
                  Ok
              </Button>
              <Button className="popup_button cancel_button" onClick={() => setIsManageGroupVisible(false)}>
                  Cancel
              </Button>
            </div>
        </div>
      </div>
      
      )}      
        
    </div> 
  );  
}