import '@/app/ui/stylesheets/joyRatingInput.css'

let star_rating: number = 0

const project_id = 'TEMPLATE' //REPLACE THIS ASAP

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

async function submitStars()
{
    fetch("http://127.0.0.1:3001/metrics/?projectId="+project_id,
        {
            method: 'GET'
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
            <button id="submit-joy-rating-button" onClick={submitStars}>Submit</button>
        </div>
    )
}