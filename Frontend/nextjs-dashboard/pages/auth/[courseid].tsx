import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import '@/app/ui/stylesheets/courseDetails.css'; 

export default function CourseDetails() {
  const router = useRouter();
  const { courseid } = router.query;
  const [courseDetails, setCourseDetails] = useState(null);
  const localId = Cookies.get('localId');

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

  return (
    <div className="page-wrapper">
      <div className="course-header">
        <h1>{courseid}</h1>
        <p>{courseDetails.courses.section} | {courseDetails.courses.term}</p>
        <p>{JSON.stringify(courseDetails, null, 2)}</p>
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
            <button className="add-button">+</button>
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
    </div>
  );
}
