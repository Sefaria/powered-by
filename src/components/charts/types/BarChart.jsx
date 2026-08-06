import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function BarChart({
  data,
  dataKey,
  categoryKey,
  title,
  layout = 'horizontal',
  height = 360,
  categoryWidth,
  barName = 'Projects',
  color = 'var(--accent)',
}) {
  return (
    <>
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p>Data unavailable.</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {layout === 'vertical' ? (
            <RechartsBarChart data={data} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey={categoryKey} width={categoryWidth} interval={0} />
              <Tooltip />
              <Bar dataKey={dataKey} name={barName} fill={color} />
            </RechartsBarChart>
          ) : (
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={categoryKey} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey={dataKey} name={barName} fill={color} />
            </RechartsBarChart>
          )}
        </ResponsiveContainer>
      )}
    </>
  )
}

export default BarChart
