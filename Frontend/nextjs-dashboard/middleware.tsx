import {NextResponse, type NextRequest } from "next/server";


//@Author: Raphael Ferreira 
//The middleware gets called for routes that require authentication 
//Ensures that the connection is not stale by verifying the user session is valid using idToken
export async function middleware(request: NextRequest){

    // console.log('PATH NAME:  ', request.nextUrl.pathname)
    if (!request.nextUrl.pathname.startsWith('/auth/') &&
        !request.nextUrl.pathname.startsWith('/_next/')) {

        //get the cookies
        const tokenId = request.cookies.get("idToken")?.value
        const localId = request.cookies.get("localId")?.value
        
        //check if cookies exist ? 
        if(!tokenId || !localId) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        const res = await fetch('http://localhost:3001/auth/validate-session?localId=' + localId + '&idToken=' + tokenId)
        const data = await res.json()

        console.log(data)

        const approved = data.approved
        
        if (approved.status == true) {

            const status = data.approved.status 
            const uid = data.approved.uid
            const force_password_reset = data.approved.force_password_reset
            console.log('status', status)
            console.log('uid: ', uid)

            
            let response = NextResponse.next()

            if(force_password_reset)
            {
                response = NextResponse.redirect(new URL('/auth/password-reset', request.url))
            }

            //response.headers.set('user-id',uid)

            return response

        }
         

        return NextResponse.redirect(new URL('/auth/login', request.url))


    }
    
    
    

}

