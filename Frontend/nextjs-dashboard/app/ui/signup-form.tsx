import {
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
  } from '@heroicons/react/24/outline';
import axios from 'axios'
import { FormEvent } from 'react'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';

let fname = ""
let lname = ""
let email = ""
let passwordA = ""
let passwordB = ""


function signupNewEmailUser(fname, lname, email, password)
{
    fetch("http://127.0.0.1:3001/auth/signup-with-email-and-password?fname="+fname+"&lname="+lname+"&email="+email+"&password="+password,
        {
            method: 'POST'
        }
    ).then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                return {
                    text: "Server not found!",
                    status: "danger"
                };
            }
  
            return response.text().then(text => {
                return {
                    text: text,
                    status: "danger"
                };
            })
        }
        return response.text().then(text => {
          return {
              text: text,
              status: "success"
          };
        })
      }).then(resp => {
        console.log("result:", resp);
        window.location.href = "/auth/login"
      })
}

  
export default function SignupForm() {
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log("TEST")
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const passwordA = formData.get('passwordA')
        const passwordB = formData.get('passwordB')
        console.log("SIGN UP BUTTON PRESSED: " + passwordA + " " + passwordB)
        if(passwordA == passwordB) // REPLACE PASSWORD LENGTH WITH PASSWORD CRITERIA CHECK
        {
            console.log("SIGN UP USER")
            const fname = formData.get('fname')
            const lname = formData.get('lname')
            signupNewEmailUser(fname, lname, email, passwordA)
        }
    }

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
            <h1 className={`test mb-3 text-2xl`}>
            Enter details to create a new account.
            </h1>
            <div className="w-full">
            <div>
                <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="fname"
                >
                First Name
                </label>
                <div className="relative">
                <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="fname"
                    type="text"
                    name="fname"
                    placeholder="First Name"
                    onChange={(event) => fname = event.target.value}
                    required
                />
                {/* <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
            </div>
            <div>
                <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="lname"
                >
                Last Name
                </label>
                <div className="relative">
                <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="lname"
                    type="text"
                    name="lname"
                    placeholder="Last Name"
                    onChange={(event) => lname = event.target.value}
                    required
                />
                {/* <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
            </div>
            <div>
                <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="email"
                >
                Email
                </label>
                <div className="relative">
                <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    onChange={(event) => email = event.target.value}
                    required
                />
                {/* <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
            </div>
            <div className="mt-4">
                <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="password"
                >
                Password
                </label>
                <div className="relative">
                <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="passwordA"
                    type="password"
                    name="passwordA"
                    placeholder="Enter password"
                    onChange={(event) => passwordA = event.target.value}
                    required
                    minLength={6}
                />
                {/* <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
            </div>
            <div className="mt-4">
                <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="password"
                >
                Confirm Password
                </label>
                <div className="relative">
                <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="passwordB"
                    type="password"
                    name="passwordB"
                    placeholder="Enter password"
                    onChange={(event) => passwordB = event.target.value}
                    required
                    minLength={6}
                />
                {/* <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
            </div>
            </div>
            <Button className="mt-4 w-full" type="submit">
            Sign Up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            </Button>
            <div className="flex h-8 items-end space-x-1">
            {/* Add form errors here */}
            </div>
        </div>
        </form>
    );
}
