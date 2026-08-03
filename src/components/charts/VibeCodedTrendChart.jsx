import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { VIBE_CODED_SERIES } from '../../utils/submissionsTrend.js'

const VIBE_CODED_COLORS = {
  'Not vibe-coded': '#2a78d6',
  'Vibe-coded': '#eb6834',
}

function VibeCodedTrendChart({ data }) {
  return (
    <>
      <h2>Vibe-coded vs. not, tracked since July 2026</h2>
      <p>
        "Vibe-coded" is a newly-tracked field, so earlier months may be undercounted or unreported rather than confirmed non-vibe-coded.
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ right: 100 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {VIBE_CODED_SERIES.map((series) => (
            <Line
              key={series}
              type="monotone"
              dataKey={series}
              name={series}
              stroke={VIBE_CODED_COLORS[series]}
              strokeWidth={2}
              dot={{ r: 3 }}
              // Same recharts 3.x animation-gating workaround as the
              // experience-level chart above — without this, the
              // end-of-line labels below silently never render.
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
                    {series}
                  </text>
                ) : null
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

export default VibeCodedTrendChart
