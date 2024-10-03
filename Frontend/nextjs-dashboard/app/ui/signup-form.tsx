import {
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
  } from '@heroicons/react/24/outline';
import '@/app/ui/stylesheets/login.css'
import { FormEvent } from 'react'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';


let account_type = 0

function signupNewEmailUser(fname, lname, email, password)
{
    fetch("http://127.0.0.1:3001/auth/signup-with-email-and-password?fname="+fname+"&lname="+lname+"&email="+email+"&password="+password+"&account_type="+account_type,
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
        try {
            let r = JSON.parse(resp.text)
            if(!r['approved'])
                throw r['reason']
            window.location.href = "/auth/login"
        } catch(err) {
            document.getElementById('login_error_span').style.display = 'block'
            document.getElementById('login_error_span').innerText = err
        }
      }).catch((error) => {
        document.getElementById('login_error_span').style.display = 'block'
        document.getElementById('login_error_span').innerText = 'Server Error'
      })
}

  
export default function SignupForm() 
{
    async function handleSubmit(event: FormEvent<HTMLFormElement>) 
    {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const passwordA = formData.get('passwordA')
        const passwordB = formData.get('passwordB')
        if(passwordA == passwordB) // REPLACE PASSWORD LENGTH WITH PASSWORD CRITERIA CHECK
        {
            console.log("SIGN UP USER")
            const fname = formData.get('fname')
            const lname = formData.get('lname')
            signupNewEmailUser(fname, lname, email, passwordA)
        }
        else
        {
            document.getElementById('login_error_span').style.display = 'block'
      document.getElementById('login_error_span').innerText = 'Passwords Do Not Match'
        }
    }

    async function redirectToLogin() 
    {
        window.location.href="/auth/login"
    }

    async function instructorTypeSelected() 
    {
        document.getElementById("instructor_type_selector").style.backgroundColor = "var(--selectorItemSelected)"
        document.getElementById("student_type_selector").style.backgroundColor = "var(--selectorItemNotSelected)"
        account_type = 1
    }

    async function studentTypeSelected() 
    {
        document.getElementById("instructor_type_selector").style.backgroundColor = "var(--selectorItemNotSelected)"
        document.getElementById("student_type_selector").style.backgroundColor = "var(--selectorItemSelected)"
        account_type = 0
    }

    return (
        <div>
            <button id="auth_redirect_button" onClick={redirectToLogin}>Sign In</button>
            <div className="login_form">
                <form onSubmit={handleSubmit}>
                    <div>
                        <h1>Sign Up</h1>
                        <span id="login_error_span">Err</span>
                        <div className="login_row">
                            <div className="login_row_item left">
                                <label htmlFor="fname">First Name</label>
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
                                <label htmlFor="fname">Last Name</label>
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
                                <label htmlFor="email">Email</label>
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
                                <label htmlFor="account_type">I am a</label>
                                {/* <input
                                    id="account_type"
                                    type="checkbox"
                                    name="account_type"
                                /> */}
                                <div id="account_type_selector">
                                    <button id="student_type_selector" onClick={studentTypeSelected} type="button">student</button>
                                    <button id="instructor_type_selector" onClick={instructorTypeSelected} type="button">instructor</button>
                                </div>
                            </div>
                        </div>
                        <div className="login_row">
                            <div className="login_row_item left">
                                <label htmlFor="passwordA">Password</label>
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
                                <label htmlFor="passwordB">Confirm Password</label>
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
