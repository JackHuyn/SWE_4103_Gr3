import { error } from 'console';
import Cookies from 'js-cookie';


//Author: Raphael Ferreira
//This function can be called across the u.i to log out
export default async function HandleLogout(){
 
        const localId = Cookies.get('localId')

        try{

            if (localId) {

                //end session on firebase
                //const logout_response = await fetch('http://localhost:3001/auth/logout?localId=' + localId)

                //const data = await logout_response.json()
            
                
                Cookies.remove('localId');  
                Cookies.remove('idToken');  
                window.location.href = "/auth/login";  
            } else {
                console.log('you are already logged out')
                window.location.href = "/auth/login"; 
            }

        }

        catch (error) {
            console.error('Error sending request:', error);
            
        }
        
    

}
