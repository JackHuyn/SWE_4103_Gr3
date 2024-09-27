//import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';  

let headers = new Headers();

headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
// headers.append('Origin','http://localhost:3001');
// headers.append("Access-Control-Allow-Origin", "http://localhost:3001");
// headers.append("Access-Control-Allow-Headers", "Content-Type, application/json");


function loginEmailUser(email, password)
{
  fetch("http://localhost:3001/auth/login-with-email-and-password?email="+email+"&password="+password,
    {
      method: 'GET',
    }
  ).then(response => {
    console.log("raw response: ", response)
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
      document.cookie = "localId="+r['localId']
      document.cookie = "idToken="+r['idToken']
      // window.location.href = "/"
    })
}

export default function LoginForm() {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("TEST")
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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`test mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
        <div className="w-full">
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
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              {/* <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full" type="submit">
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div className="flex h-8 items-end space-x-1">
          {/* Add form errors here */}
        </div>
      </div>
    </form>
  );
}
