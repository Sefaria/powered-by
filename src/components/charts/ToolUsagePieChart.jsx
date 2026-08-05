import PieChart from './types/PieChart.jsx'

const TOOL_SLICE_COLORS = [
  'var(--chart-blue)',
  'var(--chart-orange)',
  'var(--chart-aqua)',
  'var(--chart-yellow)',
  'var(--chart-magenta)',
  'var(--chart-green)',
]
const OTHER_SLICE_COLOR = 'var(--chart-neutral)'

function colorForToolSlice(entry, index) {
  return entry.endpoint === 'Other' ? OTHER_SLICE_COLOR : TOOL_SLICE_COLORS[index]
}

function ToolUsagePieChart({ data }) {
  return (
    <PieChart
      data={data}
      title="Most-used Sefaria API endpoints"
      dataKey="count"
      nameKey="endpoint"
      colorForSlice={colorForToolSlice}
    />
  )
}

export default ToolUsagePieChart
