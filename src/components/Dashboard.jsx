import { useEffect, useState } from 'react'
import { fetchProjects } from '../data/fetchProjects.js'
import { KNOWN_CATEGORIES, UNCATEGORIZED } from '../utils/categories.js'
import Controls from './Controls.jsx'
import ProjectGrid from './ProjectGrid.jsx'

const FILTER_CATEGORIES = [...KNOWN_CATEGORIES, UNCATEGORIZED]

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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

  const search = searchText.toLowerCase()

  const visibleProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.project_name.toLowerCase().includes(search) ||
        project.project_desc.toLowerCase().includes(search) ||
        project.project_category.toLowerCase().includes(search)

      const matchesCategory =
        selectedCategory === 'All' || project.primaryCategory === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.project_name.localeCompare(b.project_name))

  return (
    <>
      <Controls
        searchText={searchText}
        selectedCategory={selectedCategory}
        categories={FILTER_CATEGORIES}
        count={visibleProjects.length}
        onSearchChange={setSearchText}
        onCategoryChange={setSelectedCategory}
      />
      <ProjectGrid projects={visibleProjects} />
    </>
  )
}

export default Dashboard
