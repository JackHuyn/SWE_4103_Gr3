import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
//import { Button } from './button';
import Cookies from 'js-cookie';
import Link from 'next/link';
import FileUpload from '@/app/ui/upload-form'
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';
import { Console } from 'console';



export default function CourseDetails() {
  const router = useRouter();
  const { courseid } = router.query;
  const [courseDetails, setCourseDetails] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const localId = Cookies.get('localId');
  const [isProjectPopupVisible, setIsProjectPopupVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);// Stores true or false depending on if the popup is visible
  const [csvFile, setCsvFile] = useState(null); // Store the csv file for addingstudents
  const [userRole, setUserRole] = useState('')
  const inputRef = useRef(null); // Create a ref for the input field
  const [loading, setLoading] = useState(true) // Loading state
  //setUserRole('1')


  // Fetch projects when the component mounts
  useEffect(() => {



    async function fetchData() {


      if (router.isReady && courseid) {
        try {
          //console.log('Course .tsx is displayed')

          const localId = Cookies.get('localId')

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

            const res = await fetch('http://localhost:3001/auth/projects?localId=' + localId + '&courseId=' + courseid)
            if (!res.ok) {

              throw new Error('Failed to fetch data');
            }
            const result = await res.json();
            setProjectData(result);

            // Set the initial projects to the state if the response is approved
            if (result.approved && result.projects) {
              setProjectList(result.projects);
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
      }
    }
      fetchData();
    }, [router.isReady, courseid]);

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
      };

      fetchData();
    }
  }, [localId, courseid]);

  useEffect(() => {
    if (localId) {
      const fetchStudentList = async () => {
        try {
          const res = await fetch(
            `http://localhost:3001/auth/student_list_in_courses?localId=${localId}`
          );

          if (!res.ok) throw new Error('Failed to fetch student list');

          const data = await res.json();
          if (data.approved) {

            setStudentList(data.courses); // Store student list in state

          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchStudentList();
    }
  }, [localId]);

  if (!courseDetails) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }




  const addProject = () => {
    setIsProjectPopupVisible(true); // Show the popup
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
          alert('project added successfully!');
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

  /**useEffect(() => {
    if (isProjectPopupVisible && inputRef.current) {
        inputRef.current.focus(); // Focus the input field when the popup is shown
    }
  }, [isProjectPopupVisible]);**/

  /**useEffect(() => {
  const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isProjectPopupVisible) {
          setIsProjectPopupVisible(false); // Close the popup when Escape is pressed
      }
  };
  
  // Add event listener for keydown
  document.addEventListener('keydown', handleEscapeKey);
  
  // Cleanup function to remove event listener when component unmounts
  return () => {
      document.removeEventListener('keydown', handleEscapeKey);
  };
  }, [isProjectPopupVisible]);**/
  if (projectData && projectList.length >= 0) {
    return (
      <div className="page-wrapper">
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
              { userRole == '1' &&
                (<button className="add-button" onClick={addProject}>+ </button>)
              }
            </div>
            <div className="projects-grid">
              {projectData?.projects?.map((projects, index) => (
                <Link href={{pathname: '/projects/' + projects.project_id,
                  query:{course_id: courseid

                  },
                }}> 
                <div key={index} className="project-card">
                  
                  {projects.project_name}
                  
                </div>
                </Link>
              ))}
            </div>
            <p className="view-all">View all</p>
          </div>

          {/* Students Section */}

          <div className="students-section">
            <div className="section-header">
              <h2>Students</h2>
              { userRole == '1' && 
                (<button className="add-button" onClick={()=>setIsPopupVisible(true)}>+</button>)}
            </div>
            <div className="students-list">
              {courseDetails?.courses?.student_ids?.map((student_ids, index) => (
                <div key={index} className="student-card">
                  {student_ids}
                </div>
              ))}
            </div>
            <p className="view-all">View all</p>
          </div>
        </div>

        {isPopupVisible && (
          <div className="popup">
            <div className="popup_content">
              <h2>Upload CSV</h2>
              <input type="file" accept=".csv" onChange={handleFileChange} />
              <div className="popup_buttons">
                <button className="popup_button upload" onClick={handleUpload}>
                  Upload
                </button>
                <button className="popup_button cancel_button" onClick={() => setIsPopupVisible(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reuse FileUpload Component */}
        {localId && courseid && (
          <FileUpload localId={localId} courseId={courseid as string} />
        )}
        <p>-----Student List-----</p>
        {/* Display student list */}
        {studentList.length > 0 ? (
          <ul>
            {studentList.map((student, index) => (
              <li key={index}>{student}</li>
            ))}
          </ul>
        ) : (
          <p>No students found.</p>
        )}



        {isProjectPopupVisible && (
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
                <button className="popup_button cancel_button" onClick={() => setIsProjectPopupVisible(false)}>
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
