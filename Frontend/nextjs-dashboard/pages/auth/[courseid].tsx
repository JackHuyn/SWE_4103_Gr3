import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';



export default function CourseDetails() {
  const router = useRouter();
  const { courseid } = router.query;
  const [courseDetails, setCourseDetails] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const localId = Cookies.get('localId');
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Stores true or false depending on if the popup is visible
  const [csvFile, setCsvFile] = useState(null); // Store the csv file for addingstudents

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
      };

      fetchData();
    }
  }, [localId, courseid]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  };

  // Handle file upload
  const handleUpload = () => {
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        console.log('CSV File Content:', text);
        // Process the CSV content here (e.g., parse and add students)
      };
      reader.readAsText(csvFile);
      setIsPopupVisible(false); // Close the popup
    } else {
      alert('Please select a CSV file.');
    }
  };

  if (!courseDetails) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

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
            <button className="add-button">+</button>
          </div>
          <div className="projects-grid">
            {courseDetails?.projects?.map((project, index) => (
              <div key={index} className="project-card">
                {project.name}
              </div>
            ))}
          </div>
          <p className="view-all">View all</p>
        </div>

        {/* Students Section */}

        <div className="students-section">
          <div className="section-header">
            <h2>Students</h2>
            <button className="add-button" onClick={()=>setIsPopupVisible(true)}>+</button>
          </div>
          <div className="students-list">
            {courseDetails?.students?.map((student, index) => (
              <div key={index} className="student-card">
                {student.name}
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

    </div>
  );
}
