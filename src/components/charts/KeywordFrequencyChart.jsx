import BarChart from './types/BarChart.jsx'

function KeywordFrequencyChart({ data }) {
  return (
    <BarChart
      data={data}
      title="Keyword frequency"
      dataKey="count"
      categoryKey="keyword"
      layout="vertical"
      categoryWidth={100}
      height={data.length * 28 + 40}
    />
  )
}

export default KeywordFrequencyChart
