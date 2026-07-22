import { useEffect, useState } from 'react'
import { fetchProjects } from '../data/fetchProjects.js'
import ProjectGrid from './ProjectGrid.jsx'

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading projects…</p>
  if (error) return <p>Couldn't load projects right now.</p>

  return <ProjectGrid projects={projects} />
}

export default Dashboard
