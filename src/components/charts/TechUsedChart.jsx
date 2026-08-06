import BarChart from './types/BarChart.jsx'

function TechUsedChart({ data }) {
  return (
    <BarChart
      data={data}
      title="Technologies used"
      dataKey="count"
      categoryKey="label"
      layout="vertical"
      categoryWidth={180}
      height={data.length * 28 + 40}
    />
  )
}

export default TechUsedChart
