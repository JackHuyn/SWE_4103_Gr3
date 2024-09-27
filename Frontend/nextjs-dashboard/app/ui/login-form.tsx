//import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import '@/app/ui/stylesheets/login.css'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';


function loginEmailUser(email, password)
{
  fetch("http://localhost:3001/auth/login-with-email-and-password?email="+email+"&password="+password,
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
      document.cookie = "localId="+r['localId']+"; expires="+expires.toDateString()+"; path=/"
      document.cookie = "idToken="+r['idToken']+"; expires="+expires.toDateString()+"; path=/"
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
    if(password) // REPLACE PASSWORD LENGTH WITH PASSWORD CRITERIA CHECK
    {
        console.log("LOGIN USER")
        loginEmailUser(email, password)
    }
}

  return (
    <div className="login_form">
      <form onSubmit={handleSubmit}>
        <div>
          <h1>
            Sign In
          </h1>
          <div>
            <div>
              <span>Invalid Email or Password</span>
            </div>
            <div>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                />
                {/* <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
            </div>
            <div className="mt-4">
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  minLength={6}
                />
                {/* <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
            </div>
          </div>
          <Button className="mt-4 w-full" type="submit">
            Log in
          </Button>
          <div className="flex h-8 items-end space-x-1">
            {/* Add form errors here */}
          </div>
        </div>
      </form>
    </div>
  );
}
