import '@/app/ui/stylesheets/truckFactorStatBarItem.css'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';


export default function TruckFactorStatBarItem() {
    
    const [groupId, setGroupId] = useState(null);
    const local_id = Cookies.get('localId')
    const router = useRouter();
    const [group_size, setGroupSize] = useState(-1)
    const [avg_truck_factor, setAvgTruckFactor] = useState(-1)
    const [indicator_colour, setIndicatorColour] = useState("#0000FF")

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

            fetch("http://127.0.0.1:3001/metrics/get-avg-truck-factor?groupId="+group_id,
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
                    setAvgTruckFactor(r['avgTruckFactor'])
                    
                } catch(err) {
                    console.log(err)
                }
            }).catch((error) => {
                console.log(error)
            })
        }

    }, [router.isReady, router.query]);


    useEffect (() =>
        {
            console.log('Avg Truck Factor: ', avg_truck_factor)
            console.log('Group Size: ', group_size)

            let colour = "green"
            if(avg_truck_factor / group_size < 0.5)
                colour = "yellow"
            else if (avg_truck_factor / group_size <= 0.2)
                colour = "red"
            setIndicatorColour(colour)
            console.log("Background Color: ", indicator_colour)
    
            document.getElementById('truck-factor-stat-bar-indicator').style.backgroundColor = colour
        }, [avg_truck_factor, group_size]
    )


    return (
        <div>
            <div id="truck-factor-stat-bar-indicator"></div>
            <span>Avg Truck Factor Score: {avg_truck_factor}</span>
        </div>
    )
}