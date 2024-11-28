import '@/app/ui/stylesheets/truckFactorInput.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

let truck_factor: number = 0


async function setTruckFactor(factor: number)
{
    truck_factor = factor
    console.log("Truck Factor:", truck_factor)
}

async function submitTruckFactor(group_id, local_id)
{
    const comment = document.getElementById('truck-factor-comment-textarea').value

    fetch("http://127.0.0.1:3001/metrics/submit-truck-factor?groupId="+group_id+"&uid="+local_id+"&truckFactor="+truck_factor+"&comment="+comment,
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

export default function TruckFactorInput({closeDialogs})
{

    const [groupId, setGroupId] = useState(null);
    const local_id = Cookies.get('localId')
    const router = useRouter();
    const [group_size, setGroupSize] = useState(-1)
    
    useEffect(() => {
        if (router.isReady) {
            const group_id = router.query.groupid;
            setGroupId(group_id);
            console.log("Group ID:", group_id);

            fetch("http://127.0.0.1:3001/group/get-group-size?groupId="+group_id,
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
                    setGroupSize(r['group_size'])
                    
                } catch(err) {
                    console.log(err)
                }
            }).catch((error) => {
                console.log(error)
            })

            fetch("http://127.0.0.1:3001/metrics/get-individual-truck-factor?groupId="+group_id+"&localId="+local_id,
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

                    const truck_factor = r['truckFactor']
                    
                    document.getElementById('truck-factor-number').value = truck_factor['truck_factor']
                    document.getElementById('truck-factor-comment-textarea').innerText = truck_factor['comment']
                    
                } catch(err) {
                    console.log(err)
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [router.isReady, router.query]);

    return(
        <div id="truck-factor-dialog">
            <h2>Truck Factor</h2>
            <div id="truck">
                <label htmlFor="truck-factor-number">How many contributers could be hit by a truck before the project would hault?</label>
                <div>
                    <input onChange={(event) => {setTruckFactor(event.target.value)}} type="number" min="1" max={group_size} name="truck-factor-number" id="truck-factor-number"/>
                    <span>/ {group_size}</span>
                </div>
            </div>
            <div>
                <h3>Comment:</h3>
                <textarea name="truck-factor-comment" id="truck-factor-comment-textarea" placeholder='(optional)'></textarea>
            </div>
            <button id="submit-truck-factor-button" onClick={(event) => {submitTruckFactor(groupId, local_id); closeDialogs()}}>Submit</button>
        </div>
    )
}