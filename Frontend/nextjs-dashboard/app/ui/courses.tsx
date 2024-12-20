"use client";


import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/ui/stylesheets/coursePage.css';
import '@/app/ui/stylesheets/loading.css';
import '@/app/ui/stylesheets/popup.css';
import '@/app/ui/stylesheets/homelogout.css';
import MoonLight from '@/app/ui/logo_module';


import { Button } from './button';
import Cookies from 'js-cookie';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Router } from 'next/router';
import HandleLogout from './logout';
import Loading from '@/app/ui/Loading';



export default function Courses() {

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [showCourses, setShowCourses] = useState(true); // Track whether to show/hide courses
    const [courseList, setCourseList] = useState([]); // Store the list of courses
    const [isPopupVisible, setIsPopupVisible] = useState(false); // Control the popup visibility
    const [isPopup2Visible, setIsPopup2Visible] = useState(false); // Control the popup2 visibility
    const [newCourseName, setNewCourseName] = useState(''); // Store the new course name
    const [newCourseDescription, setNewCourseDescription] = useState(''); // Store the new course description
    const [newCourseTerm, setNewCourseTerm] = useState(''); // Store the new course term
    const [newCourseSection, setNewCourseSection] = useState(''); // Store the new course section
    const [userRole, setUserRole] = useState('')
    const [loading, setLoading] = useState(true) // Loadign state
    const inputRef = useRef(null); // Create a ref for the input field
    const [isArchivePopupVisible, setIsArchivePopupVisible] = useState(false); // Control visibility of archive popup
    const [archivedCourses, setArchivedCourses] = useState([]); // Store archived courses


    // Fetch courses data when the component mounts
    useEffect(() => {
        async function fetchData() {

            try {
                console.log('Courses .tsx is displayed')

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

                    const res = await fetch('http://localhost:3001/auth/courses?localId=' + localId)
                    if (!res.ok) {

                        throw new Error('Failed to fetch data');
                    }
                    const result = await res.json();
                    setData(result);
                    // Set the initial courses to the state if the response is approved
                    if (result.approved && result.courses) {
                        setCourseList(result.courses);
                        setLoading(false);
                    }
                }
                else {
                    window.location.href = "/auth/login"
                }

            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Error loading courses. Please try again later.');
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);



    // Show popup for adding a course
    const addCourse = () => {
        setIsPopupVisible(true); // Show the popup
    };

    const removeCourse = () => {
        setIsPopup2Visible(true); // Show the popup2
    };

    const callArchive = async (courseid) => {
        try {
            console.log('Archiving on frontend : ', courseid)
            const response = await fetch('http://localhost:3001/archive?courseId=' + courseid)
            /**{
            method: 'POST', 
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(courseList.course_id)
        })**/
            const data = await response.json()
            if (data.archive_status) {
                console.log(data.archive_status)

            }
            else {
                console.log("Archive is not possible")
            }

            window.location.reload();
        }

        catch (error) {
            console.error('Error sending request:', error);
            alert('Error archiving course. Please try again later.');
        }
    }


    // Handle adding a new course with name, description, and term
    const handleAddCourse = async () => {
        if (newCourseName && newCourseDescription && newCourseTerm && newCourseSection) {

            //Ensure localId cookie is valid
            const localId = Cookies.get('localId')

            if (!localId) {
                window.location.href = "/auth/login"
            }
            const courseData = {
                course_name: newCourseName,
                course_description: newCourseDescription,
                course_term: newCourseTerm,
                course_section: newCourseSection,
                instructor_ids: [localId]
            };

            try {

                //Need to have checks to ensure that the instructor is valid 
                const response = await fetch('http://localhost:3001/add-course', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify(courseData),  // Send JSON data in request body
                });

                const result = await response.json();

                if (response.ok) {
                    window.location.reload();
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

    //handling remove course with course id

    const handleRemoveCourse = async () => {
        if (newCourseName) {

            //Ensure localId cookie is valid
            const localId = Cookies.get('localId')

            if (!localId) {
                window.location.href = "/auth/login"
            }
            const courseData = {
                course_name: newCourseName
            };

            try {


                //Need to have checks to ensure that the instructor is valid 
                const response = await fetch('http://localhost:3001/remove-course', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify(courseData),  // Send JSON data in request body
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Course removed successfully!');
                    window.location.reload();
                    // Reset form and close popup
                    setNewCourseName('');
                    setIsPopup2Visible(false);
                } else {
                    alert(`Error removing course: ${result.reason}`);
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

    if (loading) {
        return (
            <div className="spinner-wrapper">
                <div className="spinner"></div>
            </div>
        );
    }

    const fetchArchivedCourses = async () => {
        const localId = Cookies.get('localId');

        if (localId) {
            try {
                const response = await fetch(`http://localhost:3001/get-archived-courses?localId=${localId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch archived courses');
                }
                const result = await response.json();
                setArchivedCourses(result.courses);
            } catch (error) {
                console.error('Error fetching archived courses:', error);
            }
        } else {
            window.location.href = "/auth/login";
        }
    };



    const handleUnarchiveCourse = async (courseId) => {
        const localId = Cookies.get('localId');

        if (!localId) {
            window.location.href = "/auth/login";
        }

        try {
            const response = await fetch('http://localhost:3001/unarchive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })  // Sending the courseId as JSON
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Course unarchived successfully!');
                setIsArchivePopupVisible(false);  // Close the popup after unarchiving
                window.location.reload();  // Refresh the page to show the updated course list
            } else {
                alert(`Error unarchiving course: ${result.reason}`);
            }
        } catch (error) {
            console.error('Error sending unarchive request:', error);
            alert('Error unarchiving course. Please try again later.');
        }
    };





    if (data) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
                <div className="flex flex-col items-center justify-center bg-white rounded-lg p-10 shadow-md">

                    <div className="button-bar">

                        {/* Home Button on the Left */}

                        <Link href="/">
                            {/* <button id="home">Home</button> */}
                            <MoonLight></MoonLight>
                        </Link>

                        {/* Logout Button on the Right */}
                        <button id="logout" onClick={HandleLogout}>
                            Log Out
                        </button>
                    </div>

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

                        {/* Right Section: Add and Remove Buttons */}
                        {userRole === '1' && (
                            <div className="dropdown">
                                <button className="dropdown-button">⋮</button>
                                <div className="dropdown-menu">
                                    <button onClick={() => setIsPopupVisible(true)} className="addCourse">Add Course</button>
                                    <button onClick={() => setIsPopup2Visible(true)} className="removeCourse">Remove Course</button>
                                    <button onClick={() => { setIsArchivePopupVisible(true); fetchArchivedCourses(); }} className="archive_courses">View Archived</button>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Conditionally render courses */}
                    {showCourses && (
                        <div className="courses">
                            {courseList.map((course, index) => (
                                <div key={course.course_id || index} className="course mb-4 p-4 bg-gray-100 rounded shadow">
                                    <Link
                                        href={{
                                            pathname: '/c/[slug]',
                                            query: { slug: course.course_id }
                                        }
                                        } className="link">
                                        <div className="titleline">
                                            <h3 className="course-title">{course.course_id}</h3>
                                            {userRole == '1' && <Button
                                                className="archive"
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent default link behavior
                                                    e.stopPropagation(); // Prevent navigation to course page
                                                    callArchive(course.course_id);
                                                }}
                                            >
                                                -
                                            </Button>}
                                        </div>


                                        {/* 
                                    <Card shadow="sm" key={index} isPressable onPress={() => console.log(course.course_id)}>
                                    
                                    <CardHeader className="justify-between">
                                        
                                    <h3 className="course-title">{course.course_name}</h3>
                                    </CardHeader>
                                    
                                    <CardBody className="overflow-visible p-0"></Card>*/}
                                        <p className="course-detail">Description: {course.course_description}</p>
                                        <p className="course-detail">Section: {course.section}</p>
                                        <p className="course-detail">Term: {course.term}</p>


                                        {/*</CardBody>*/}

                                    </Link>

                                </div>

                            ))}
                        </div>
                    )}

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
                                type="text" className='desc'
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

                {isArchivePopupVisible && (
                    <div className="popup">
                        <div className="popup_content">
                            <h2>Archived Courses</h2>
                            {archivedCourses.length === 0 ? (
                                <p>No archived courses available.</p>
                            ) : (
                                <div>
                                    {archivedCourses.map((course) => (
                                        <div key={course.course_id} className="archived-course-item">
                                            <p id="archive_course_id">{course.course_name} - {course.course_id}</p>
                                            <button
                                                className="unarchive-button"
                                                onClick={() => handleUnarchiveCourse(course.course_id)}
                                            >
                                                Unarchive
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                className="popup_button cancel_button"
                                onClick={() => setIsArchivePopupVisible(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}



                {/* Popup Window for Removing Course */}
                {isPopup2Visible && (
                    <div className="popup">
                        <div className="popup_content">
                            <h2>Enter Course ID</h2>

                            <input
                                ref={inputRef} // Attach the ref to the input field
                                type="text"
                                value={newCourseName}
                                onChange={(e) => setNewCourseName(e.target.value)}
                                placeholder="Course ID"
                            />

                            <div className="popup_buttons">
                                <Button className="popup_button" onClick={handleRemoveCourse}>
                                    Remove
                                </Button>
                                <Button className="popup_button cancel_button" onClick={() => setIsPopup2Visible(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}


            </main>
        );
    }

    //else if(courseList.length == 0 && userRole == '0')
    //{
    //return <p>You have not yet been added to any courses. Contact your Instructor for information.</p>
    //}


    else {
        return <Loading />;
    }
}
