import {NextResponse, type NextRequest } from "next/server";


//@Author: Raphael Ferreira 
//The middleware gets called for routes that require authentication 
//Ensures that the connection is not stale by verifying the user session is valid using idToken
export async function middleware(request: NextRequest){

    
    if (request.nextUrl.pathname.startsWith('/c')) {

        //get the cookies
        const tokenId = request.cookies.get("idToken")?.value
        const localId = request.cookies.get("localId")?.value
        
        //check if cookies exist ? 
        if(!tokenId || !localId) {
            return NextResponse.redirect(new URL('/auth/login', request.url))

        }

        const res = await fetch('http://localhost:3001/auth/validate-session?localId=' + localId + '&idToken=' + tokenId)
        const data = await res.json()

        const approved = data.approved
        
        if (approved!=false) {

            const status = data.approved.status 
            const uid = data.approved.uid
            console.log('status', status)
            console.log('uid: ', uid)

            const response = NextResponse.next()

            //response.headers.set('user-id',uid)

            return response

        }
         

       return NextResponse.next()


    }
    
    
    

}

