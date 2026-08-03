import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EXPERIENCE_LEVELS } from '../../utils/experience.js'

const EXPERIENCE_COLORS = {
  'No Experience': '#2a78d6',
  Beginner: '#eb6834',
  Intermediate: '#1baf7a',
  Advanced: '#4a3aa7',
}

function ExperienceTrendChart({ data }) {
  return (
    <>
      <h2>Submissions by experience level</h2>
      {data.length === 0 ? (
        <p>Data unavailable.</p>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data} margin={{ right: 100 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {EXPERIENCE_LEVELS.map((level) => (
              <Line
                key={level}
                type="monotone"
                dataKey={level}
                name={level}
                stroke={EXPERIENCE_COLORS[level]}
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
                      {level}
                    </text>
                  ) : null
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  )
}

export default ExperienceTrendChart
