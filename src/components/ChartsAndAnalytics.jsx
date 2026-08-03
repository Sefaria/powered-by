import { useEffect, useState } from 'react'
import { fetchProjects } from '../data/fetchProjects.js'
import {
  getSubmissionsMonthlyTrend,
  getSubmissionsTrendByExperience,
  getSubmissionsTrendByVibeCoded,
} from '../utils/submissionsTrend.js'
import { getKeywordCounts } from '../utils/keywords.js'
import { getToolUsageCounts } from '../utils/sefariaTools.js'
import { getTechCounts } from '../utils/techUsed.js'
import SubmissionsTrendChart from './charts/SubmissionsTrendChart.jsx'
import KeywordFrequencyChart from './charts/KeywordFrequencyChart.jsx'
import ExperienceTrendChart from './charts/ExperienceTrendChart.jsx'
import ToolUsagePieChart from './charts/ToolUsagePieChart.jsx'
import VibeCodedTrendChart from './charts/VibeCodedTrendChart.jsx'
import TechUsedChart from './charts/TechUsedChart.jsx'

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
      <SubmissionsTrendChart data={trend} />
      <KeywordFrequencyChart data={keywordCounts} />
      <ExperienceTrendChart data={experienceTrend} />
      <ToolUsagePieChart data={toolUsage} />
      <VibeCodedTrendChart data={vibeCodedTrend} />
      <TechUsedChart data={techCounts} />
    </div>
  )
}

export default ChartsAndAnalytics
