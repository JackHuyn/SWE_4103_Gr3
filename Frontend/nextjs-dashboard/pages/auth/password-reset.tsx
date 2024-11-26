import '@/app/ui/stylesheets/password-reset.css'
import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';



export default function PasswordReset() {
    async function submitPasswordChangeRequest() 
    {
        const local_id = Cookies.get('localId')

        const current_password = document.getElementById('current-password').value
        const password = document.getElementById('password').value
        const confirm_password = document.getElementById('confirm-password').value

        if(password != confirm_password)
        {
            document.getElementById('password-reset-error').innerText = 'Passwords Do Not Match'
            return false;
        }

        await fetch("http://127.0.0.1:3001/auth/password-reset?localId="+local_id+"&currentPassword="+current_password+"&password="+password,
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
                    throw 'idek bro'
                console.log(r)

                window.location.href = '/auth/login'
                
            } catch(err) {
                console.log(err)
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    return(
        <form onSubmit={submitPasswordChangeRequest} id="password-reset-form">
            <h1>PASSWORD RESET</h1>
            <div>
                <label htmlFor="current-password">Current Password:</label>
                <input type="password" name="current-password" id="current-password" />
                <label htmlFor="password">New Password:</label>
                <input type="password" name="password" id="password" />
                <label htmlFor="confirm-password">Confirm New Password:</label>
                <input type="password" name="confirm-password" id="confirm-password" />
            </div>
            <span id="password-reset-error"></span>
            <button type='button' onClick={submitPasswordChangeRequest}>Submit</button>
        </form>
    )
}