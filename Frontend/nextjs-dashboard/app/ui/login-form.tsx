//import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import '@/app/ui/stylesheets/login.css'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';


function loginEmailUser(email, password) {
  fetch("http://localhost:3001/auth/login-with-email-and-password?email=" + email + "&password=" + password,
    {
      method: 'GET',
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
          text: response.status + ": " + text,
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
    let r = JSON.parse(resp.text)
    const expires = new Date(Date.now() + 60 * 60 * 1000)
    console.log('Expiry date: ', expires.toDateString())
    document.cookie = "localId=" + r['localId'] + "; expires=" + expires.toDateString() + "; path=/"
    document.cookie = "idToken=" + r['idToken'] + "; expires=" + expires.toDateString() + "; path=/"
    console.log("Cookies: ", document.cookie)
    window.location.href = "/"
  })
}

export default function LoginForm() {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')
    console.log("SIGN UP BUTTON PRESSED: " + password)
    if (password) // REPLACE PASSWORD LENGTH WITH PASSWORD CRITERIA CHECK
    {
      console.log("LOGIN USER")
      loginEmailUser(email, password)
    }
  }

  async function redirectToSignUp() {
    window.location.href = "/auth/signup"
  }

  return (
    <div>
      <button id="auth_redirect_button" onClick={redirectToSignUp}>Sign Up</button>
      <div className="login_form">
        <form onSubmit={handleSubmit}>
          <div>
              <h1>Sign In</h1>
            <span>Invalid Email or Password</span>
            <div className="login_row">
              <div className="login_row_item left">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="login_row_item right">
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit">Log in</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
