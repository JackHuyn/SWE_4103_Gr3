import {
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
  } from '@heroicons/react/24/outline';
import '@/app/ui/stylesheets/login.css'
import { FormEvent } from 'react'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';


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

    async function redirectToLogin() {
        window.location.href="/auth/login"
    }

    return (
        <div>
            <button id="auth_redirect_button" onClick={redirectToLogin}>Sign In</button>
            <div className="login_form">
                <form onSubmit={handleSubmit}>
                    <div>
                        <h1>Sign Up</h1>
                        <div className="login_row">
                            <div className="login_row_item left">
                                <input
                                    id="fname"
                                    type="text"
                                    name="fname"
                                    placeholder="First Name"
                                    // onChange={(event) => fname = event.target.value}
                                    required
                                />
                            </div>
                            <div className="login_row_item right">
                                <input
                                    id="lname"
                                    type="text"
                                    name="lname"
                                    placeholder="Last Name"
                                    // onChange={(event) => lname = event.target.value}
                                    required
                                />
                            </div>
                        </div>
                        <div className="login_row">
                            <div className="login_row_item left">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    // onChange={(event) => email = event.target.value}
                                    required
                                />
                            </div>
                            <div className="login_row_item right">
                                <input
                                    id="account_type"
                                    type="checkbox"
                                    name="account_type"
                                />
                            </div>
                        </div>
                        <div className="login_row">
                            <div className="login_row_item left">
                                <input
                                    id="passwordA"
                                    type="password"
                                    name="passwordA"
                                    placeholder="Password"
                                    // onChange={(event) => passwordA = event.target.value}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="login_row_item right">
                                <input
                                    id="passwordB"
                                    type="password"
                                    name="passwordB"
                                    placeholder="Confirm password"
                                    // onChange={(event) => passwordB = event.target.value}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <Button type="submit">Sign Up</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
