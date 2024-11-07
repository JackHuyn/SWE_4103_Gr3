import '@/app/ui/stylesheets/joyRatingInput.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

let star_rating: number = 0


async function setStars(num_stars: number)
{
    console.log(num_stars)
    let star_buttons = document.getElementsByClassName('star_button')
    for(let i = 0; i < star_buttons.length; i++)
    {
        if(i <= num_stars - 1)
            star_buttons[i].textContent = '★'
        else
            star_buttons[i].textContent = '☆'
    }
    star_rating = num_stars
}

async function submitStars(group_id, local_id)
{
    const comment = document.getElementById('joy-comment-textarea').value

    fetch("http://127.0.0.1:3001/metrics/submit-joy-rating?groupId="+group_id+"&uid="+local_id+"&joyRating="+star_rating+"&comment="+comment,
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
        }
    }).catch((error) => {
        console.log(error)
    })
}

export default function JoyRatingInput()
{

    const [groupId, setGroupId] = useState(null);
    const local_id = Cookies.get('localId')
    const router = useRouter();
    
    useEffect(() => {
        if (router.isReady) {
            const group_id = router.query.group_id;
            setGroupId(group_id);
            console.log("Group ID:", group_id);
        }
    }, [router.isReady, router.query]);

    return(
        <div id="joy-rating-dialog">
            <h1>Rate Your Joy Level Today</h1>
            <div id="joy-stars" className='★'>
                <button className='star_button' onClick={(event) => setStars(1)}>☆</button>
                <button className='star_button' onClick={(event) => setStars(2)}>☆</button>
                <button className='star_button' onClick={(event) => setStars(3)}>☆</button>
                <button className='star_button' onClick={(event) => setStars(4)}>☆</button>
                <button className='star_button' onClick={(event) => setStars(5)}>☆</button>
            </div>
            <div>
                <h3>Comment:</h3>
                <textarea name="joy-comment" id="joy-comment-textarea" placeholder='(optional)'></textarea>
            </div>
            <button id="submit-joy-rating-button" onClick={(event) => submitStars(groupId, local_id)}>Submit</button>
        </div>
    )
}