import BarChart from './types/BarChart.jsx'

function SubmissionsTrendChart({ data }) {
  return (
    <BarChart
      data={data}
      title={`Submissions since ${data[0]?.month}`}
      dataKey="count"
      categoryKey="month"
      barName="Submissions"
    />
  )
}

export default SubmissionsTrendChart
