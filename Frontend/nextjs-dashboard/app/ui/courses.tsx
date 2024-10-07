import { useEffect, useState } from 'react';
// import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon, CheckBadgeIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { cookies } from 'next/headers';

// async function validate_token() {
//   const localId = cookies().get('localId')?.value;
//   const idToken = cookies().get('idToken')?.value;

//   if (!localId || !idToken) {
//     return false;
//   }

//   const response = await fetch(
//     `http://localhost:3001/auth/validate-session?localId=${localId}&idToken=${idToken}`,
//     {
//       method: 'GET',
//     }
//   );

//   if (!response.ok) {
//     return false;
//   }

//   const data = await response.json();
//   return data.approved === true;
// }

export default function Courses() {
  // const [valid, setValid] = useState(null);
  // const router = useRouter();

  // useEffect(() => {
  //   const checkToken = async () => {
  //     const isValid = await validate_token();
  //     setValid(isValid);

  //     if (!isValid) {
  //       router.push('/auth/login'); // Redirect to login page if token is invalid
  //     }
  //   };

  //   checkToken();
  // }, [router]);

  // if (valid === null) {
  //   return <div>Loading...</div>; // Add a loading state
  // }

  // if (!valid) {
  //   return null; // Avoid rendering anything while redirecting
  // }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="flex flex-col items-center justify-center bg-white rounded-lg p-10 shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Courses</h1>
        <Link
          href={"/courses"}
          className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
          <span>View Courses</span> <CheckIcon className="w-2 md:w-3" />
        </Link>
      </div>
    </main>

  );
}
