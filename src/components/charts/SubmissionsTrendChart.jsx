import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function SubmissionsTrendChart({ data }) {
  return (
    <>
      <h2>Submissions, past 12 months</h2>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="Submissions" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default SubmissionsTrendChart
