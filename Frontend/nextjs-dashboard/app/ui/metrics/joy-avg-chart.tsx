import Chart from 'chart.js/auto'

async function getChart() {
    console.log('GET CHART CALLED')
    let contributions = []
    return fetch("http://127.0.0.1:3001/metrics/get-avg-team-joy-ratings",
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
            //let weeks = []
            const contributions = r['joyData']
            const days = contributions.map(row => row.date)

            let avg_joy_graph_data = 
                [
                    {
                        label: 'AVG',
                        data: contributions.map(row => row.avg)
                    }
                ]

            const config = {
                type: 'line',
                data: {
                    labels: days,
                    datasets: avg_joy_graph_data
                },
                options: {
                    indexAxis: 'x',
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'none',
                      },
                      title: {
                        display: false,
                        text: 'Avg Joy'
                      }
                    }
                  }
            };

            return new Chart(
                    document.getElementById('avg-joy-graph'),
                    config
                )
        } catch(err) {
            console.log(err)
        }
    }).catch((error) => {
        console.log(error)
    })
}

export default function ContributionsGraph()
{
    return(
        <div id="avg-joy-container">
            <h3>Average Team Joy</h3>
            <div style={{width: '800px'}}><canvas id="avg-joy-graph"></canvas></div>
            <button onClick={getChart}>test</button>
        </div>
    )
}