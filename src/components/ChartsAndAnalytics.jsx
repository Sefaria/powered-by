import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchProjects } from '../data/fetchProjects.js'
import { getSubmissionsMonthlyTrend } from '../utils/submissionsTrend.js'
import { getKeywordCounts } from '../utils/keywords.js'

function ChartsAndAnalytics() {
  const [trend, setTrend] = useState(null)
  const [keywordCounts, setKeywordCounts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then((projects) => {
        setTrend(getSubmissionsMonthlyTrend(projects))
        setKeywordCounts(getKeywordCounts(projects))
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="charts-and-analytics">Couldn't load chart data right now.</p>
  if (!trend || !keywordCounts) return <p className="charts-and-analytics">Loading chart…</p>

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
    </div>
  )
}

export default ChartsAndAnalytics
