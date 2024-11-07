import '@/app/ui/stylesheets/teamVelocityInput.css'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

let star_rating: number = 0



export default function TeamVelocityInput({ closeDialogs })
{
    const local_id = Cookies.get('localId')
    const [groupId, setGroupId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            const group_id = router.query.group_id;
            setGroupId(group_id);
            console.log("Group ID:", group_id);
        }
    }, [router.isReady, router.query]);

    async function submitVelocity()
    {
        const start_date = document.getElementById('start-date').value
        const end_date = document.getElementById('end-date').value
        const planned_story_points = document.getElementById('planned-story-points').value
        const completed_story_points = document.getElementById('completed-story-points').value

        fetch("http://127.0.0.1:3001/metrics/submit-team-velocity?localId="+local_id+"&groupId="+groupId+"&startDate="+start_date+"&endDate="+end_date+"&plannedStoryPoints="+planned_story_points+"&completedStoryPoints="+completed_story_points,
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

                closeDialogs()

            } catch(err) {
                console.log(err)
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    return(
        <div id="team-velocity-dialog">
            <h1>Update Your Team's Velocity For This Sprint</h1>

            <div>
                <label htmlFor="start-date">Start Date:</label>
                <input name="start-date" id="start-date" type="date" />
                <label htmlFor="end-date">End Date:</label>
                <input name="end-date" id="end-date" type="date" />
            </div>

            <div>
                <label htmlFor="planned-story-points">Planned Story Points:</label>
                <input name="planned-story-points" id="planned-story-points" type="number" min="0" max="1000" step="1" />
                <label htmlFor="completed-story-points">Completed Story Points:</label>
                <input name="completed-story-points" id="completed-story-points" type="number" min="0" max="1000" step="1" />
            </div>
            
            <button id="submit-team-velocity-button" onClick={submitVelocity}>Submit</button>
        </div>
    )
}