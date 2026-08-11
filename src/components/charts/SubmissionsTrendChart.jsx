import BarChart from './types/BarChart.jsx'

function SubmissionsTrendChart({ data }) {
  return (
    <BarChart
      data={data}
      title="Submissions since August 2025"
      dataKey="count"
      categoryKey="month"
      barName="Submissions"
    />
  )
}

export default SubmissionsTrendChart
