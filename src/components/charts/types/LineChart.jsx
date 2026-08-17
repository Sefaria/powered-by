import { CartesianGrid, Legend, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function LineChart({ data, series, title, description, height = 360 }) {
  return (
    <>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {data.length === 0 ? (
        <p>Data unavailable.</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data} margin={{ right: 100 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {/* Legend's default itemSorter is 'value', which alphabetizes entries by
                name — overriding the order series/<Line> below are declared in (e.g.
                "Not vibe-coded" would sort before "Vibe-coded"). itemSorter must be a
                function (or a string key) — Recharts calls it unconditionally, so
                passing null risks breaking rather than disabling the sort. Sort by
                each item's index in `series` instead, to preserve declaration order;
                unmatched items (shouldn't normally happen) go last. */}
            <Legend
              itemSorter={(item) => {
                const index = series.findIndex(({ name }) => name === item.value)
                return index === -1 ? series.length : index
              }}
            />
            {series.map(({ key, name, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
                // recharts 3.x gates the custom `label` render-prop behind an internal
                // isAnimating flag cleared via onAnimationEnd, which doesn't fire
                // reliably in this dev environment — without this, the end-of-line
                // labels below silently never render (no test/lint failure to catch it).
                isAnimationActive={false}
                label={(props) =>
                  props.index === data.length - 1 ? (
                    <text
                      x={props.x + 6}
                      y={props.y}
                      dy={4}
                      fill="var(--text-h)"
                      fontSize={12}
                    >
                      {name}
                    </text>
                  ) : null
                }
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      )}
    </>
  )
}

export default LineChart
