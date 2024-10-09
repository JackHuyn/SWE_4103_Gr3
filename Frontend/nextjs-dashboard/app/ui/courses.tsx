import { useEffect, useState } from 'react';
// import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon, CheckBadgeIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Courses() {
// const getData = async (e: React.FormEvent<HTMLFormElement>) =>
// {
  fetch('http://localhost:3001/students/courses?studentId=2',{
    method: 'GET'
  })
// }
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="flex flex-col items-center justify-center bg-white rounded-lg p-10 shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Courses</h1>
        <Link
          href={"/courses"}
          className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
          <span>View Courses</span> 
        </Link>
      </div>
    </main>

  );
}
