import LineChart from './types/LineChart.jsx'
import { EXPERIENCE_LEVELS } from '../../utils/experience.js'

const EXPERIENCE_COLORS = {
  'No Experience': 'var(--chart-blue)',
  Beginner: 'var(--chart-orange)',
  Intermediate: 'var(--chart-aqua)',
  Advanced: 'var(--chart-violet)',
}

function ExperienceTrendChart({ data }) {
  return (
    <LineChart
      data={data}
      title="Submissions by experience level"
      series={EXPERIENCE_LEVELS.map((level) => ({
        key: level,
        name: level,
        color: EXPERIENCE_COLORS[level],
      }))}
    />
  )
}

export default ExperienceTrendChart
