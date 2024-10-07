import React, { useState, useEffect, useRef } from 'react';
import '@/app/ui/stylesheets/coursepage.css'; // Ensure this path is correct
import { Button } from './button';

export default function Courses() {
  const [courseCount, setCourseCount] = useState(0); // Track the number of courses
  const [showCourses, setShowCourses] = useState(true); // Track whether to show/hide courses
  const [courseNames, setCourseNames] = useState([]); // Store course names
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Control the popup visibility
  const [newCourseName, setNewCourseName] = useState(''); // Store the new course name
  const inputRef = useRef(null); // Create a ref for the input field

  const addCourse = () => {
    setIsPopupVisible(true); // Show the popup
  };

  const handleAddCourseName = () => {
    if (newCourseName) {
      setCourseNames([...courseNames, newCourseName]); // Add the new course name
      setNewCourseName(''); // Reset input
      setCourseCount(courseCount + 1); // Increment course count
      setIsPopupVisible(false); // Hide the popup
    }
  };

  const toggleCourses = () => {
    setShowCourses(!showCourses);
  };

  // Automatically focus on the input when the popup becomes visible
  useEffect(() => {
    if (isPopupVisible && inputRef.current) {
      inputRef.current.focus(); // Focus the input field when the popup is shown
    }
  }, [isPopupVisible]); // Run when popup visibility changes

  // Escape key event listener
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
  }, [isPopupVisible]); // Add the event listener only when the popup is visible

  return (
    <div className="page_wrapper">
      <div className="coursepage">
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
            <h1>courses</h1>
          </div>

          {/* Right Section: Add Course Button */}
          <Button className="addCourse" onClick={addCourse}>
            +
          </Button>
        </div>

        {/* Conditionally render courses */}
        {showCourses && (
          <div className="courses">
            {courseNames.map((name, index) => (
              <button key={index} className="course">
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popup Window for Adding Course */}
      {isPopupVisible && (
        <div className="popup">
          <div className="popup_content">
            <h2>Enter Course Name</h2>
            <input
              ref={inputRef} // Attach the ref to the input field
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Course Name"
            />
            <Button className="popup_button" onClick={handleAddCourseName}>
              Add Course
            </Button>
            <Button className="popup_button" onClick={() => setIsPopupVisible(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
