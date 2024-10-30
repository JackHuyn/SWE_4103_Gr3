import ContributionsGraph from '../app/ui/metrics/contributions-graph'
import JoyRatingInput from '@/app/ui/metrics/joy-rating-input'
import JoyAvgChart from '@/app/ui/metrics/joy-avg-chart'
import JoyStudentRatingGraph from '@/app/ui/metrics/joy-student-rating-graph'
import TeamVelocityGraph from '@/app/ui/metrics/team-velocity-graph'

export default function Metrics() {
    return (
        <div>
            <ContributionsGraph />
            <JoyRatingInput />
            <JoyAvgChart />
            <JoyStudentRatingGraph />
            <TeamVelocityGraph />
        </div>
    )
}