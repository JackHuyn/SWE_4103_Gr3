import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/ui/stylesheets/coursePage.css'; // Ensure this path is correct
import { Button } from './button';

export default function Courses() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showCourses, setShowCourses] = useState(true); // Track whether to show/hide courses
    const [courseList, setCourseList] = useState([]); // Store the list of courses
    const [isPopupVisible, setIsPopupVisible] = useState(false); // Control the popup visibility
    const [newCourseName, setNewCourseName] = useState(''); // Store the new course name
    const [newCourseDescription, setNewCourseDescription] = useState(''); // Store the new course description
    const [newCourseTerm, setNewCourseTerm] = useState(''); // Store the new course term
    const [newCourseSection, setNewCourseSection] = useState(''); // Store the new course section
    const inputRef = useRef(null); // Create a ref for the input field

    // Fetch courses data when the component mounts
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('http://localhost:3001/auth/students/courses');
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await res.json();
                setData(result);
                // Set the initial courses to the state if the response is approved
                if (result.approved && result.courses) {
                    setCourseList(result.courses);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Error loading courses. Please try again later.');
            }
        }
        fetchData();
    }, []);

    // Show popup for adding a course
    const addCourse = () => {
        setIsPopupVisible(true); // Show the popup
    };

    // Handle adding a new course with name, description, and term
    const handleAddCourse = async () => {
        if (newCourseName && newCourseDescription && newCourseTerm && newCourseSection) {
            const courseData = {
                course_name: newCourseName,
                course_description: newCourseDescription,
                course_term: newCourseTerm,
                course_section: newCourseSection,
                instructor_ids: ["some_instructor_id"],  // Adjust this based on how you manage instructors
            };
    
            try {
                const response = await fetch('http://localhost:3001/add-course?courseName=' + newCourseName + "&courseDescription=" + newCourseDescription + "&courseTerm=" + newCourseTerm + "&courseSection=" + newCourseSection, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData),  // Send JSON data in request body
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    alert('Course added successfully!');
                    setCourseList([...courseList, courseData]); // Add the new course to the list
                    // Reset form and close popup
                    setNewCourseName('');
                    setNewCourseDescription('');
                    setNewCourseTerm('');
                    setNewCourseSection('');
                    setIsPopupVisible(false);
                } else {
                    alert(`Error adding course: ${result.reason}`);
                }
            } catch (error) {
                console.error('Error sending request:', error);
                alert('Error adding course. Please try again later.');
            }
        } else {
            alert('Please fill in all the fields.');
        }
    };
    


    // Toggle the visibility of the course list
    const toggleCourses = () => {
        setShowCourses(!showCourses);
    };

    // Automatically focus on the input when the popup becomes visible
    useEffect(() => {
        if (isPopupVisible && inputRef.current) {
            inputRef.current.focus(); // Focus the input field when the popup is shown
        }
    }, [isPopupVisible]);

    // Escape key event listener to close the popup
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isPopupVisible) {
                setIsPopupVisible(false); // Close the popup when Escape is pressed
            }
        };

        // Add event listener for keydown
        document.addEventListener('keydown', handleEscapeKey);

        // Cleanup function to remove event listener when component unmounts
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isPopupVisible]);

    if (error) {
        return <p>{error}</p>;
    }

    if (data && data.approved && courseList.length > 0) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
                <div className="flex flex-col items-center justify-center bg-white rounded-lg p-10 shadow-md">
                    <div className="header">
                        {/* Left Section: Toggle Button and Title */}
                        <div className="header_left">
                            <Button
                                className="toggleCourses"
                                onClick={toggleCourses}
                                style={{
                                    transform: showCourses ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.1s ease',
                                }}
                            >
                                &gt;
                            </Button>
                            <h1>Courses</h1>
                        </div>

                        {/* Right Section: Add Course Button */}
                        <Button className="addCourse" onClick={addCourse}>
                            +
                        </Button>
                    </div>

                    {/* Conditionally render courses */}
                    {showCourses && (
                        <div className="courses">
                            {courseList.map((course, index) => (
                                <div key={course.course_id || index} className="course mb-4 p-4 bg-gray-100 rounded shadow">
                                    <h3 className="course-title">{course.course_name}</h3>
                                    <p className="course-detail">Description: {course.course_description}</p>
                                    <p className="course-detail">Section: {course.section}</p>
                                    <p className="course-detail">Term: {course.term}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link
                        href="/auth/login"
                        className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Popup Window for Adding Course */}
                {isPopupVisible && (
                    <div className="popup">
                        <div className="popup_content">
                            <h2>Add New Course</h2>
                            <input
                                ref={inputRef} // Attach the ref to the input field
                                type="text"
                                value={newCourseName}
                                onChange={(e) => setNewCourseName(e.target.value)}
                                placeholder="Course Name"
                            />
                            <input
                                type="text"  className='desc'
                                value={newCourseDescription}
                                onChange={(e) => setNewCourseDescription(e.target.value)}
                                placeholder="Course Description"
                            />
                            <input
                                type="text"
                                value={newCourseSection}
                                onChange={(e) => setNewCourseSection(e.target.value)}
                                placeholder="Course Section"
                            />
                            <input
                                type="text"
                                value={newCourseTerm}
                                onChange={(e) => setNewCourseTerm(e.target.value)}
                                placeholder="Course Term"
                            />

                            <div className="popup_buttons">
                                <Button className="popup_button" onClick={handleAddCourse}>
                                    Add Course
                                </Button>
                                <Button className="popup_button cancel_button" onClick={() => setIsPopupVisible(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}


            </main>
        );
    } else {
        return <p>Loading...</p>;
    }
}
