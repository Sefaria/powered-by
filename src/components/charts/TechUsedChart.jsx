import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function TechUsedChart({ data }) {
  return (
    <>
      <h2>Technologies used</h2>
      {data.length === 0 ? (
        <p>Data unavailable.</p>
      ) : (
        <ResponsiveContainer width="100%" height={data.length * 28 + 40}>
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={180} interval={0} />
            <Tooltip />
            <Bar dataKey="count" name="Projects" fill="var(--accent)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  )
}

export default TechUsedChart
