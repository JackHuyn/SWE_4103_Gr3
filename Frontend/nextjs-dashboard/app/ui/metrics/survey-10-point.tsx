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
    const [points, setPoints] = useState([]);
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
                    const initialPoints = data.student_list.map(student => ({
                        studentId: student.uid,
                        points: 0,
                    }));
                    setPoints(initialPoints);
                } catch (error) {
                    console.error("Error fetching student data:", error);
                }
            };
          fetchData(); // Call fetchData
        }
    }, [router.isReady, router.query]);

    const handleInputChange = (studentId, value) => {
        setPoints(prev =>
            prev.map(entry =>
                entry.studentId === studentId
                    ? { ...entry, points: parseInt(value, 10) || 0 }
                    : entry
            )
    )};

    const handleSubmit = async () => {
        try {
            const payload = {
                groupId,
                students: points, // Contains studentId and points
            };

            const response = await fetch('http://localhost:3001/save-survey-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Data successfully saved:', result);
                alert('Survey points successfully submitted!');
            } else {
                console.error('Failed to save data:', response.statusText);
                alert('Failed to submit points.');
            }
        } catch (error) {
            console.error('Error sending data to backend:', error);
            alert('An error occurred while submitting points.');
        }
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
                                    type="number"
                                    value={
                                        points.find(entry => entry.studentId === student.uid)?.points || ""
                                    }
                                    onChange={(e) => handleInputChange(student.uid, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="popup_buttons">
                        <Button className="popup_button" onClick={handleSubmit}>
                            Confirm
                        </Button>    
                    </div>
            </div>
        </div>
    )
}