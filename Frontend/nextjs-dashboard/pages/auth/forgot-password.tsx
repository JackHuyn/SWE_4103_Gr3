import '@/app/ui/stylesheets/password-reset.css'
import '@/app/ui/stylesheets/logo.css'

import Cookies from 'js-cookie';




export default function PasswordReset() {
    async function submitPasswordChangeRequest() {
        const email = document.getElementById('email').value

        await fetch("http://127.0.0.1:3001/auth/forgot-password?email=" + email,
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
                if (!r['approved'])
                    throw 'idek bro'
                console.log(r)

            } catch (err) {
                console.log(err)
                document.getElementById('password-reset-error').innerText = err
            }
        }).catch((error) => {
            console.log(error)

        })
    }

    return (
        <div className="page_wrapper">
    <div className="logo">
        <img width="48" height="48" src="https://img.icons8.com/?size=100&id=11377&format=png&color=ffffff" alt="moon-satellite" className='logo-image'/>
    </div>

    <div className="reset_form">
        <form onSubmit={submitPasswordChangeRequest} id="password-reset-form">
            <h1>Password Reset</h1>

            <div className="login_row">
                <span id="password-reset-error"></span>
                <div className="login_row_item">
                    <label htmlFor="email" className="input_label">Email:</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="you@company.com"
                        required
                    />
                </div>
                <button type="button" onClick={submitPasswordChangeRequest} className="submit_button">Send password reset email</button>
            </div>
        </form>
    </div>
</div>

    );
}
