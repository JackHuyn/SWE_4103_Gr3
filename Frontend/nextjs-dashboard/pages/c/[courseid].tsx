import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import Link from 'next/link';
import FileUpload from '@/app/ui/upload-form'
import HandleLogout from '@/app/ui/logout';
import '@/app/ui/stylesheets/coursePage.css';
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';
import '@/app/ui/stylesheets/homelogout.css';
import MoonLight from '@/app/ui/logo_module';




export default function CourseDetails() {
  const router = useRouter();
  const { courseid } = router.query;
  const [isSingleStudentTab, setIsSingleStudentTab] = useState(true);

  const [courseDetails, setCourseDetails] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [removedStudents, setRemovedStudents] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [newStudentFName, setNewStudentFName] = useState('');
  const [newStudentLName, setNewStudentLName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const localId = Cookies.get('localId');
  const [isProjectPopup1Visible, setIsProjectPopup1Visible] = useState(false); //add project
  const [isProjectPopup2Visible, setIsProjectPopup2Visible] = useState(false); //remove project
  const [isStudentPopup1Visible, setIsStudentPopup1Visible] = useState(false); //add a student
  const [isStudentPopup2Visible, setIsStudentPopup2Visible] = useState(false); //add students
  const [isStudentPopup3Visible, setIsStudentPopup3Visible] = useState(false); //remove students
  const [newProjectName, setNewProjectName] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);// Stores true or false depending on if the popup is visible
  const [csvFile, setCsvFile] = useState(null); // Store the csv file for addingstudents
  const [userRole, setUserRole] = useState('')
  const inputRef = useRef(null); // Create a ref for the input field
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState("");  
  //setUserRole('1')



  useEffect(() => {
    if (localId && courseid) {
      const fetchData = async () => {
        const res = await fetch(
          `http://localhost:3001/auth/course_home_page?localId=${localId}&courseId=${courseid}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        setCourseDetails(data);

        setStudentList(data.courses.student_ids)
        console.log(data)

        try {
          //console.log('Course .tsx is displayed')
          //if (!router.isReady) return;
          //const localId = Cookies.get('localId')

          if (localId) {

            const role_response = await fetch('http://localhost:3001/check-instructor?localId=' + localId)

            //check if instructor role ? If not show student display
            if (!role_response.ok) {
              setUserRole('0')
            }
            else {
              //fetching same for instructor
              setUserRole('1')
            }
            //project part
            const res = await fetch('http://localhost:3001/auth/projects?localId=' + localId + '&courseId=' + courseid)
            if (!res.ok) {

              throw new Error('Failed to fetch data');
            }
            const result = await res.json();

            // Set the initial projects to the state if the response is approved
            if (result.approved && result.projects) {
              console.log('it has been approved')
              setProjectData(result);
              setProjectList(result.projects);
              setLoading(false);
            }
            //student part
            const stu_f = await fetch('http://localhost:3001/auth/course/students_info?localId=' + localId + '&courseId=' + courseid)
            if (!stu_f.ok) {
              throw new Error('Failed to fetch data');
            }
            const stu_r = await stu_f.json();
            if (stu_r.approved && stu_r.students) {
              console.log('it has been approved')
              setStudentData(stu_r);
              setStudentList(stu_r.students);
              setLoading(false);
            }
          }
          else {
            window.location.href = "/auth/login"
          }

        } catch (error) {
          console.error('Error fetching projects:', error);
          setError('Error loading projects. Please try again later.');
        }
        finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [localId, courseid]);

  if (!courseDetails) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }




  const addProject = () => {
    setIsProjectPopup1Visible(true); // Show the popup
  };

  // Handle adding a new course with name, description, and term
  const handleAddProject = async () => {

    if (newProjectName) {

      //Ensure localId cookie is valid
      const localId = Cookies.get('localId')

      if (!localId) {
        window.location.href = "/auth/login"
      }
      const projectData = {
        course_id: courseid,
        project_id: courseid + "_" + newProjectName,
        project_name: newProjectName


      };

      try {

        //Need to have checks to ensure that the instructor is valid 
        const response = await fetch('http://localhost:3001/add-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',

          },
          body: JSON.stringify(projectData),  // Send JSON data in request body
        });

        const result = await response.json();

        if (response.ok) {
          window.location.reload();
          //alert('project added successfully!');
          window.location.reload();

        } else {
          alert(`Error adding project: ${result.reason}`);
        }
      } catch (error) {
        console.error('Error sending request:', error);
        alert('Error adding project. Please try again later.');
      }

    } else {
      alert('Please provide a project name.');
    }
};
//-----------------------------------------------------
//------------------ Remove Project -------------------
const removeProject = () =>{
    setIsProjectPopup2Visible(true);
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
                //alert('Project removed successfully!');
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
//------------------- Add a Student -------------------
//Function: set visibiliy of addStudent popup
const addStudent = () => {
    setIsStudentPopup1Visible(true);
};
//Function: handle add student
const handleAddStudent = async () => {  
    if (newStudentFName && newStudentLName && newStudentEmail) {
        const localId  = Cookies.get('localId')
        if (!localId){
            window.location.href = "/auth/login"
        }
        const studentData = {
            course_id: courseid,
            student_fname: newStudentFName,
            student_lname: newStudentLName,
            student_email: newStudentEmail
        };
        try { 
            const response = await fetch('http://localhost:3001/add-a-student' , {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify(studentData),
            });
            const result = await response.json();
            if (response.ok) {
                window.location.reload();
                //alert('student added successfully!');
                window.location.reload();
            } else {
                alert(`Error adding student: ${result.reason}`);
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Error adding student. Please try again later.');
        }
    } else {
        alert('Please provide all information.');
    }
};
//-----------------------------------------------------
//-------------------- Add Students -------------------
//Function: set visibiliy of uploadStudent popup
const uploadStudents = () =>{
    setIsStudentPopup2Visible(true);
};
//-----------------------------------------------------
//------------------ Remove Students ------------------
//Function: set visibiliy of removeStudents popup
const removeStudents = () =>{
    setIsStudentPopup3Visible(true);
};
//Function: handle checkbox change
const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prevSelected) => {
        if (prevSelected.includes(studentId)) {
            return prevSelected.filter((id) => id !== studentId);
        } else {
            return [...prevSelected, studentId];
        }
    });
};
//Function: handle remove students
const handleRemoveStudents = async () => {
    const localId  = Cookies.get('localId')
    if (!localId){
        window.location.href = "/auth/login"
    }
    const studentsToRemove = studentData?.students?.filter(student => selectedStudents.includes(student.uid));
    setRemovedStudents(studentsToRemove); // Store removed students in the state
    setSelectedStudents([]); // Clear the selected students after removal
    const removedList = {
        course_id: courseid,
        remove_list: studentsToRemove
    };
    try { 
        const response = await fetch('http://localhost:3001/remove-students-course' , {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(removedList),
        });
        const result = await response.json();
        if (response.ok) {
            window.location.reload();
            //alert('removed successfully!');
            window.location.reload();
        } else {
            alert(`Error removing students: ${result.reason}`);
        }
    } catch (error) {
    console.error('Error sending request:', error);
    alert('Error removing student. Please try again later.');
    }
};
//-----------------------------------------------------

if (projectData) {
    return (
      <div className="page-wrapper">
        <div className="button-bar">
          {/* Home Button on the Left */}
          <Link href="/">
            <MoonLight></MoonLight>
          </Link>

          {/* Logout Button on the Right */}
          <button id="logout" onClick={HandleLogout}>
            Log Out
          </button>
        </div>
        <div className="course-header">
          <h1>{courseid}</h1>
          {/* <p>{JSON.stringify(courseDetails, null, 2)}</p> */}
          <p>{courseDetails.courses.section} | {courseDetails.courses.term}</p>

        </div>

        <div className="content-grid">

          {/* Projects Section */}

          <div className="projects-section">
          
            <div className="section-header">
              <h2>Projects</h2>
              {userRole === '1' && (
                <div className="addandremove">
                   <button className="add-button" onClick={addProject}> + </button>
                   <button className="remove-button" onClick = {removeProject}> - </button>     
                </div>
              )}
            </div>
            <div className="projects-grid">
              {projectData?.projects?.map((projects, index) => (
                <Link href={{
                  pathname: '/c/[course_slug]/p/[project_slug]/',
                  query: { course_slug: projects.course_id, project_slug: projects.project_id }
                }
                }>
                  <div key={index} className="project-card">

                    {projects.project_name}

                  </div>
                </Link>
              ))}
            </div>
            <p className="view-all"></p>
          </div>
          {/* Students Section */}
          <div className="students-section">
            <div className="section-header">
              <h2>Students</h2>
              {userRole === '1' && (
                <div className="options-container">
                  <button className="options-button">⋮</button>
                  <div className="options-menu">
                    <a onClick={addStudent}>Add a Student</a>
 
                    <a onClick={removeStudents}>Remove Students</a>
                  </div>
                </div>
              )}
            </div>
            <div className="students-list">
              {studentData?.students?.map((students, index) => (
                <Link href={'/students_info/' + students.uid}>
                  <div key={index} className="student-card">
                    {students.first_name + " " + students.last_name}
                  </div>
                </Link>
              ))}
            </div>
            <p className="view-all"></p>
          </div>
        </div>

        {/*Handle add project*/}
        {isProjectPopup1Visible && (
          <div className="popup">
            <div className="popup_content">
              <h2>Add New Project</h2>
              <input
                ref={inputRef} // Attach the ref to the input field
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Name" />

              <div className="popup_buttons">
                <button className="popup_button" onClick={handleAddProject}>
                  Add Project
                </button>
                <button className="popup_button cancel_button" onClick={() => setIsProjectPopup1Visible(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      {/*Handle remove project*/}
      {isProjectPopup2Visible && (
          <div className="popup">
              <div className="popup_content">
                  <h2>Enter Course ID</h2>
                  <input
                      ref={inputRef}
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project Name"
                  />
                  <div className="popup_buttons">
                  <button className="popup_button" onClick={handleRemoveProject}>
                          Remove
                      </button>
                      <button className="popup_button cancel_button" onClick={() => setIsProjectPopup2Visible(false)}>
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}          
      {/*Handle add student*/}
      {isStudentPopup1Visible && (
          <div className="popup">
            <div className="popup_content">
              <h2 className="popup_title">Manage Students</h2>
              <div className="tab-container">
                <button
                  className={`tab ${isSingleStudentTab ? 'active-tab' : ''}`}
                  onClick={() => setIsSingleStudentTab(true)}
                >
                  Add Single Student
                </button>
                <button
                  className={`tab ${!isSingleStudentTab ? 'active-tab' : ''}`}
                  onClick={() => setIsSingleStudentTab(false)}
                >
                  Upload CSV
                </button>
              </div>

              <div className="popup_body">
                {isSingleStudentTab ? (
                  <>
                    <input
                      className="popup_input"
                      type="text"
                      value={newStudentFName}
                      onChange={(e) => setNewStudentFName(e.target.value)}
                      placeholder="First Name"
                    />
                    <input
                      className="popup_input"
                      type="text"
                      value={newStudentLName}
                      onChange={(e) => setNewStudentLName(e.target.value)}
                      placeholder="Last Name"
                    />
                    <input
                      className="popup_input"
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="Email"/>
                  </>
                ) : (
                  <div className="file-upload-wrapper">
                    <FileUpload localId={localId} courseId={courseid as string} />
                  </div>
                )}
              </div>

              <div className="popup_buttons">
                {isSingleStudentTab ? (
                  <button className="popup_button" onClick={handleAddStudent}>
                    Add Student
                  </button>
                ) : null}
                <button
                  className="popup_button cancel_button"
                  onClick={() => setIsStudentPopup1Visible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      {/*Handle upload students*/}
      {isStudentPopup2Visible && (
        <div className="popup">
          <div className="popup_content">
            <FileUpload localId={localId} courseId={courseid as string} />
            <div className="popup_buttons">
                      <button className="popup_button cancel_button" onClick={() => setIsStudentPopup2Visible(false)}>
                          Cancel
                      </button>
                  </div>
          </div>
        </div>
      )}
      {/*Handle remove student*/}
      {isStudentPopup3Visible && (
        <div className="popup">
          <div className="popup_content">
            <h1>Select Student to Remove</h1>
            <div className="checkbox-list">
              <div className="checkbox-header">
                <div className="header-item">Student Name</div>
                <div className="header-item">To Remove</div>
              </div>
              {studentData?.students?.map((student, index) => (
                <div className="checkbox-item" key={index}>
                  <div className="checkbox-name">
                    {student.first_name+" "+student.last_name}
                  </div>
                  <div className="checkbox-column">
                    <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(student.uid)}
                      checked={selectedStudents.includes(student.uid)}
                    /></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="popup_buttons">
            <button className="popup_button" onClick={handleRemoveStudents}>
                  Remove
              </button>
              <button className="popup_button cancel_button" onClick={() => setIsStudentPopup3Visible(false)}>
                  Cancel
              </button>
            </div>
          </div>
        </div>
      )}          
      </div>



    );
  }

  else {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );

  }
}