import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import '@/app/ui/stylesheets/login.css'
import {redirect} from 'next/navigation'
import { cookies } from 'next/headers';
import Courses from '@/app/ui/courses'

async function validate_token()
{
    let getCookieValue = (cookies, name) =>
        {
            return useEffect(() => {
                const regex = new RegExp(`(^| )${name}=([^;]+)`)
                const match = cookies.match(regex)
                if (match) 
                {
                    return match[2]
                }
            })
        }
    
        let local_id = cookies().get('localId')?.value
        let id_token = cookies().get('idToken')?.value
        console.log('Cookies: ', cookies())

        // console.log('hp-localId: ', local_id)
        // console.log('hp-idToken: ', id_token)
    
        if(local_id == undefined || id_token == undefined)
        {
            return false
        }
    
        return fetch("http://localhost:3001/auth/validate-session?localId="+local_id+"&idToken="+id_token,
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
          let r = JSON.parse(resp.text)
          console.log('Validation Response: ', r)
          console.log('Approved: ', r['approved'])
          return r['approved'] ? true : false
        })
}

export default function HomePage()
{
    return validate_token().then((valid) => {
        //console.log('Valid: ', valid)

        if(!valid)
        {
            console.log('Redirect')
            //window.location.href('/auth/login')
            return redirect('/auth/login')
        }
        else
        {
            return (
                <Courses />
                );
        }
    })
    
    
        
}