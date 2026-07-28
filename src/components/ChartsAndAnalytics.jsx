import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchProjects } from '../data/fetchProjects.js'
import { getSubmissionsMonthlyTrend, getSubmissionsTrendByExperience } from '../utils/submissionsTrend.js'
import { getKeywordCounts } from '../utils/keywords.js'
import { EXPERIENCE_LEVELS } from '../utils/experience.js'

const EXPERIENCE_COLORS = {
  'No Experience': '#2a78d6',
  Beginner: '#eb6834',
  Intermediate: '#1baf7a',
  Advanced: '#4a3aa7',
}

function ChartsAndAnalytics() {
  const [trend, setTrend] = useState(null)
  const [keywordCounts, setKeywordCounts] = useState(null)
  const [experienceTrend, setExperienceTrend] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then((projects) => {
        setTrend(getSubmissionsMonthlyTrend(projects))
        setKeywordCounts(getKeywordCounts(projects))
        setExperienceTrend(getSubmissionsTrendByExperience(projects))
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="charts-and-analytics">Couldn't load chart data right now.</p>
  if (!trend || !keywordCounts || !experienceTrend) return <p className="charts-and-analytics">Loading chart…</p>
  if (experienceTrend.length === 0) {
    return <p className="charts-and-analytics">No experience-level data available yet.</p>
  }

  return (
    <div className="charts-and-analytics">
      <h2>Submissions, past 12 months</h2>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={trend}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="Submissions" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Keyword frequency</h2>
      <ResponsiveContainer width="100%" height={keywordCounts.length * 28 + 40}>
        <BarChart
          data={keywordCounts}
          layout="vertical"
          margin={{ left: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="keyword" width={100} />
          <Tooltip />
          <Bar dataKey="count" name="Projects" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Submissions by experience level</h2>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={experienceTrend} margin={{ right: 100 }}>
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
                props.index === experienceTrend.length - 1 ? (
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
    </div>
  )
}

export default ChartsAndAnalytics
