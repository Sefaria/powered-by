import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

// Fixed-order categorical hues; gray is reserved for the "Other" bucket and
// is never one of the 6 identity colors.
const TOOL_SLICE_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']
const OTHER_SLICE_COLOR = '#9a9a94'

function colorForToolSlice(endpoint, index) {
  return endpoint === 'Other' ? OTHER_SLICE_COLOR : TOOL_SLICE_COLORS[index]
}

function ToolUsagePieChart({ data }) {
  return (
    <>
      <h2>Most-used Sefaria API endpoints</h2>
      {data.length === 0 ? (
        <p>Data unavailable.</p>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="endpoint"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.endpoint} fill={colorForToolSlice(entry.endpoint, index)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </>
  )
}

export default ToolUsagePieChart
