import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import FileUpload from '@/app/ui/upload-form'
export default function CourseDetails() {
  const router = useRouter();
  const { courseid } = router.query; // destructuring to get courseid
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
    <div>
      <h1> Details Page {courseid} </h1>
      {courseDetails ? (
        <pre>{JSON.stringify(courseDetails, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}

      {/* Reuse FileUpload Component */}
      {localId && courseid && (
        <FileUpload localId={localId} courseId={courseid as string} />
      )}
    </div>
  );
}