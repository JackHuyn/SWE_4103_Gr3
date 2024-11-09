import '@/app/ui/stylesheets/login.css'

export default function PasswordReset() {
    return(
        <div>
            <h1>PASSWORD RESET</h1>
            <div>
                <label htmlFor="current-password">Current Password:</label>
                <input type="password" name="current-password" id="current-password" />
                <label htmlFor="password">New Password:</label>
                <input type="password" name="password" id="password" />
                <label htmlFor="confirm-password">Confirm New Password:</label>
                <input type="password" name="confirm-password" id="confirm-password" />
            </div>
        </div>
    )
}