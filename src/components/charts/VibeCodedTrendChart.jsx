import LineChart from './types/LineChart.jsx'
import { VIBE_CODED_SERIES } from '../../utils/submissionsTrend.js'

const VIBE_CODED_COLORS = {
  'Vibe-coded': 'var(--chart-orange)',
  'Not vibe-coded': 'var(--chart-blue)',
}

function VibeCodedTrendChart({ data }) {
  return (
    <LineChart
      data={data}
      title="Vibe-coded vs. not, tracked since July 2026"
      description={'"Vibe-coded" is a newly-tracked field, so earlier months may be undercounted or unreported rather than confirmed non-vibe-coded.'}
      series={VIBE_CODED_SERIES.map((series) => ({
        key: series,
        name: series,
        color: VIBE_CODED_COLORS[series],
      }))}
    />
  )
}

export default VibeCodedTrendChart
