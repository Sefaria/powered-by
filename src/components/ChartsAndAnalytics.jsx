import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchProjects } from '../data/fetchProjects.js'
import {
  getSubmissionsMonthlyTrend,
  getSubmissionsTrendByExperience,
  getSubmissionsTrendByVibeCoded,
  VIBE_CODED_SERIES,
} from '../utils/submissionsTrend.js'
import { getKeywordCounts } from '../utils/keywords.js'
import { getToolUsageCounts } from '../utils/sefariaTools.js'
import { getTechCounts } from '../utils/techUsed.js'
import { EXPERIENCE_LEVELS } from '../utils/experience.js'

const EXPERIENCE_COLORS = {
  'No Experience': '#2a78d6',
  Beginner: '#eb6834',
  Intermediate: '#1baf7a',
  Advanced: '#4a3aa7',
}

// Fixed-order categorical hues; gray is reserved for the "Other" bucket and
// is never one of the 6 identity colors.
const TOOL_SLICE_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']
const OTHER_SLICE_COLOR = '#9a9a94'

function colorForToolSlice(endpoint, index) {
  return endpoint === 'Other' ? OTHER_SLICE_COLOR : TOOL_SLICE_COLORS[index]
}

const VIBE_CODED_COLORS = {
  'Not vibe-coded': '#2a78d6',
  'Vibe-coded': '#eb6834',
}

function ChartsAndAnalytics() {
  const [trend, setTrend] = useState(null)
  const [keywordCounts, setKeywordCounts] = useState(null)
  const [experienceTrend, setExperienceTrend] = useState(null)
  const [toolUsage, setToolUsage] = useState(null)
  const [vibeCodedTrend, setVibeCodedTrend] = useState(null)
  const [techCounts, setTechCounts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then((projects) => {
        setTrend(getSubmissionsMonthlyTrend(projects))
        setKeywordCounts(getKeywordCounts(projects))
        setExperienceTrend(getSubmissionsTrendByExperience(projects))
        setToolUsage(getToolUsageCounts(projects))
        setVibeCodedTrend(getSubmissionsTrendByVibeCoded(projects))
        setTechCounts(getTechCounts(projects))
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="charts-and-analytics">Couldn't load chart data right now.</p>
  if (!trend || !keywordCounts || !experienceTrend || !toolUsage || !vibeCodedTrend || !techCounts) {
    return <p className="charts-and-analytics">Loading chart…</p>
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
      {experienceTrend.length === 0 ? (
        <p>No experience-level data available yet.</p>
      ) : (
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
      )}

      <h2>Most-used Sefaria API endpoints</h2>
      {toolUsage.length === 0 ? (
        <p>No endpoint data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={toolUsage}
              dataKey="count"
              nameKey="endpoint"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={false}
            >
              {toolUsage.map((entry, index) => (
                <Cell key={entry.endpoint} fill={colorForToolSlice(entry.endpoint, index)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      <h2>Vibe-coded vs. not, past 12 months</h2>
      <p>
        "Vibe-coded" is a newly-tracked field, so earlier months may be undercounted or unreported rather than confirmed non-vibe-coded.
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={vibeCodedTrend} margin={{ right: 100 }}>
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
                props.index === vibeCodedTrend.length - 1 ? (
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

      <h2>Technologies used</h2>
      {techCounts.length === 0 ? (
        <p>No technology data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={techCounts.length * 28 + 40}>
          <BarChart
            data={techCounts}
            layout="vertical"
            margin={{ left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={140} />
            <Tooltip />
            <Bar dataKey="count" name="Projects" fill="var(--accent)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default ChartsAndAnalytics
