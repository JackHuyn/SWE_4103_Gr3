import '@/app/ui/stylesheets/teamVelocityInput.css'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Button } from 'app/ui/button';
import Cookies from 'js-cookie';
import '@/app/ui/stylesheets/courseDetails.css';
import '@/app/ui/stylesheets/popup.css';

export default function SurveyCEAB() {
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
                        points: { Q1:0, Q2:0, Q3:0, Q4:0, Q5:0, Q6:0, Q7:0, Q8:0, Q9:0, Q10:0 },
                    }));
                    setPoints(initialPoints);
                } catch (error) {
                    console.error("Error fetching student data:", error);
                }
            };
          fetchData(); // Call fetchData
        }
    }, [router.isReady, router.query]);

    const handleInputChange = (studentId, question, value) => {
        setPoints(prev =>
            prev.map(entry =>
                entry.studentId === studentId
                    ? { ...entry, points: { ...entry.points, [question]: parseInt(value, 10) || 0 } }
                    : entry
            )
        );
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                group_id: groupId,
                student_id: local_id,
                points: points
            };

            const response = await fetch('http://localhost:3001/survey-ceab', {
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

    const totalPoints = studentList.length*10;

    return(
        <div className="popup">
            <div className="popup_content">
                <h2>CEAB Survey</h2>
                <h3>PartA: Contributions </h3>
                <h3>Q1: Prepare for and attends scheduled meetings, making positive contributions</h3>
                <h3>Q2: Reliably fulfills assigned tasks on time such that content meets team expectations</h3>
                <h3>Q3: Takes initiative by volunteering for tasks</h3>
                <h3>Q4: Helps to organize the team, set goals, and distribute tasks respectfully and equitably based on member strengths and weaknesses</h3>
                <h3>Q5: Evaluates team effectiveness and plans for improvement</h3>
                <div className="checkbox-list">
                    <div className="checkbox-header">
                        <div className="header-item">Student Name</div>
                        <div className="header-item">Q1</div>
                        <div className="header-item">Q2</div>
                        <div className="header-item">Q3</div>
                        <div className="header-item">Q4</div>
                        <div className="header-item">Q5</div>
                    </div>       
                </div>
                {studentList?.map((student, index) => (
                    <div className="checkbox-item" key={index}>
                        <div className="checkbox-name">
                            {student.first_name+" "+student.last_name}
                        </div>
                        {['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].map((question) => (
                            <div className="checkbox-column" key={question}>
                                <input
                                    type="number"
                                    value={points.find(entry => entry.studentId === student.uid)?.points[question] || 0}
                                    onChange={(e) => handleInputChange(student.uid, question, e.target.value)}
                                    style={{ width: '25px' }}
                                />
                            </div>
                        ))}
                    </div>
                ))}
                <h3>PartB: Interactions </h3>
                <h3>Q6: Recognizes when personal behaviors are working for or against the team and adjusts them accordingly</h3>
                <h3>Q7: Encourages involvement of others by respecting diversity of thought and working preferences and listening with focused attention</h3>
                <h3>Q8: Instills trust through constructive reaction and feedback</h3>
                <h3>Q9: Applies principles of conflict management to resolve team issues</h3>
                <h3>Q10: Recognizes the strengths and weaknesses of collaborative decision making to facilitate collaboration when appropriate</h3>
                <div className="checkbox-list">
                    <div className="checkbox-header">
                        <div className="header-item">Student Name</div>
                        <div className="header-item">Q6</div>
                        <div className="header-item">Q7</div>
                        <div className="header-item">Q8</div>
                        <div className="header-item">Q9</div>
                        <div className="header-item">Q10</div>
                    </div>       
                </div>
                {studentList?.map((student, index) => (
                    <div className="checkbox-item" key={index}>
                        <div className="checkbox-name">
                            {student.first_name+" "+student.last_name}
                        </div>
                        {['Q6', 'Q7', 'Q8', 'Q9', 'Q10'].map((question) => (
                            <div className="checkbox-column" key={question}>
                                <input
                                    type="number"
                                    value={points.find(entry => entry.studentId === student.uid)?.points[question] || 0}
                                    onChange={(e) => handleInputChange(student.uid, question, e.target.value)}
                                    style={{ width: '25px' }}
                                />
                            </div>
                        ))}
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