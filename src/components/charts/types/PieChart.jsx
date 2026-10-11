import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts'

function PieChart({ data, dataKey, nameKey, title, colorForSlice, height = 360, outerRadius = 120 }) {
  return (
    <>
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p>Data unavailable.</p>
      ) : (
        <ResponsiveContainer width="100%" height={height} className="pie-chart">
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={outerRadius}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry[nameKey]} fill={colorForSlice(entry, index)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      )}
    </>
  )
}

export default PieChart
