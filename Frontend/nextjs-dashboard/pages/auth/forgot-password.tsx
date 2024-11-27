import '@/app/ui/stylesheets/password-reset.css'
import Cookies from 'js-cookie';



export default function PasswordReset() {
    async function submitPasswordChangeRequest() 
    {
        const email = document.getElementById('email').value

        await fetch("http://127.0.0.1:3001/auth/forgot-password?email="+email,
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
                
            } catch(err) {
                console.log(err)
                document.getElementById('password-reset-error').innerText = err
            }
        }).catch((error) => {
            console.log(error)
            
        })
    }

    return(
        <form onSubmit={submitPasswordChangeRequest} id="password-reset-form">
            <h1>PASSWORD RESET</h1>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" name="email" id="email" />
            </div>
            <span id="password-reset-error"></span>
            <button type='button' onClick={submitPasswordChangeRequest}>Submit</button>
        </form>
    )
}