import BarChart from './types/BarChart.jsx'

function SubmissionsTrendChart({ data }) {
  return (
    <BarChart
      data={data}
      title="Submissions, past 12 months"
      dataKey="count"
      categoryKey="month"
      barName="Submissions"
    />
  )
}

export default SubmissionsTrendChart
