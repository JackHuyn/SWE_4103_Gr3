import { useState, useEffect } from 'react';
import Link from 'next/link';
// need json file to test
export default function Courses() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    // use effect prevent we fetching before rendering the page
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('http://localhost:3001/students/courses');
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                   
                }
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Error loading courses. Please try again later.');
            }
        }
        fetchData();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (data && data.approved && data.courses) {
        const courses = data.courses;

        return (
            <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
                <div className="flex flex-col items-center justify-center bg-white rounded-lg p-10 shadow-md">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Courses</h1>
                    {courses.length > 0 ? (
                        courses.map((course, index) => (
                            <div key={course.id || index} className="mb-4">
                                <div className="text-lg text-gray-700">
                                    {course.name} {/* Adjust based on your course object structure */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No courses available for this student.</p>
                    )}
                    <Link
                        href={"/auth/login"}
                        className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                        <span>View More Courses</span>
                    </Link>
                </div>
            </main>
        );
    } else {
        return <p>Loading...</p>;
    }
}
