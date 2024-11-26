import '@/app/ui/stylesheets/teamVelocityInput.css'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/popup.css';

export default function Survey10point() {
    const local_id = Cookies.get('localId')
    const [groupId, setGroupId] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
          const groupId = router.query.groupid; // Extract group ID from query
          setGroupId(groupId);
          console.log("Group ID:", groupId);
    
          const fetchData = async () => {
            try {
              const res = await fetch(`http://localhost:3001/get-group-students?groupId=${groupId}`);
              const data = await res.json();
              setStudentList(data.student_list || []); // Fallback to empty array if data is undefined
            } catch (error) {
              console.error("Error fetching student data:", error);
            }
          };
    
          fetchData(); // Call fetchData
        }
      }, [router.isReady, router.query]);

      const handleSubmit = () => {
        console.log("Form submitted");
        // Add form submission logic here
      };

    return(
        <div className="popup">
            <div className="popup_content">
                <h2>Survey</h2>
                <h3>10-point distribution: total points = studentNum*10</h3>
                    <div className="checkbox-list">
                        <div className="checkbox-header">
                            <div className="header-item">Student Name</div>
                            <div className="header-item">Point</div>
                        </div>       
                    </div>
                    {studentList?.map((student, index) => (
                        <div className="checkbox-item" key={index}>
                            <div className="checkbox-name">
                                {student.first_name+" "+student.last_name}
                            </div>
                            <div className="checkbox-column">
                                <input
                                    type="text"
                                />
                            </div>
                        </div>
                    ))}
                                <div className="popup_buttons">
                                    <Button className="popup_button" >
                                          Ok
                                    </Button>
        
                                </div>
                            </div>
                        </div>
    )
}