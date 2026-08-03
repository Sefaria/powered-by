import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function KeywordFrequencyChart({ data }) {
  return (
    <>
      <h2>Keyword frequency</h2>
      <ResponsiveContainer width="100%" height={data.length * 28 + 40}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="keyword" width={100} />
          <Tooltip />
          <Bar dataKey="count" name="Projects" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default KeywordFrequencyChart
