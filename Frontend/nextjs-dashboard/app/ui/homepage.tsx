import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import '@/app/ui/stylesheets/login.css';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function validate_token() {
    const local_id = cookies().get('localId')?.value;
    const id_token = cookies().get('idToken')?.value;
    
    console.log('Cookies: ', cookies());

    if (local_id === undefined || id_token === undefined) {
        return false;
    }

    return fetch(`http://localhost:3001/auth/validate-session?localId=${local_id}&idToken=${id_token}`, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                return {
                    text: "Server not found!",
                    status: "danger",
                };
            }

            return response.text().then(text => ({
                text: text,
                status: "danger",
            }));
        }
        return response.text().then(text => ({
            text: text,
            status: "success",
        }));
    })
    .then(resp => {
        let r = JSON.parse(resp.text);
        console.log('Validation Response: ', r);
        console.log('Approved: ', r['approved']);
        return r['approved'] ? true : false;
    });
}

export default async function HomePage() {
    const valid = await validate_token();

    if (!valid) {
        console.log('Redirect');
        return redirect('/auth/login');
    } else {
        return (
            <main className="flex min-h-screen flex-col p-6">
                <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                    {/* <AcmeLogo /> */}
                </div>
                <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
                    <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
                        <p className="text-xl text-gray-800 md:text-3xl md:leading-normal">
                            <strong>Welcome to Acme.</strong> This is the example for the{' '}
                            <a href="https://nextjs.org/learn/" className="text-blue-500">
                                Next.js Learn Course
                            </a>
                            , brought to you by Vercel.
                        </p>
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                        >
                            <span>Log in</span>
                        </Link>
                    </div>
                    <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
                        {/* Add Hero Images Here */}
                    </div>
                </div>
            </main>
        );
    }
}
