import { useEffect, useState } from 'react'
import { fetchProjects } from '../data/fetchProjects.js'
import { KNOWN_CATEGORIES, UNCATEGORIZED } from '../utils/categories.js'
import { paginate } from '../utils/pagination.js'
import { sortProjects } from '../utils/sortProjects.js'
import Controls from './Controls.jsx'
import ProjectGrid from './ProjectGrid.jsx'
import Pagination from './Pagination.jsx'

const FILTER_CATEGORIES = [...KNOWN_CATEGORIES, UNCATEGORIZED]
const PAGE_SIZE = 24

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortOption, setSortOption] = useState('alphabetical')
  const [currentPage, setCurrentPage] = useState(1)

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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(search) ||
      project.project_desc.toLowerCase().includes(search) ||
      project.project_category.toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory === 'All' || project.categories.includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  const visibleProjects = sortProjects(filteredProjects, sortOption)

  const { pageItems, totalPages } = paginate(visibleProjects, currentPage, PAGE_SIZE)

  function handleSearchChange(value) {
    setSearchText(value)
    setCurrentPage(1)
  }

  function handleCategoryChange(value) {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  function handleSortChange(value) {
    setSortOption(value)
    setCurrentPage(1)
  }

  return (
    <>
      <Controls
        searchText={searchText}
        selectedCategory={selectedCategory}
        categories={FILTER_CATEGORIES}
        sortOption={sortOption}
        count={visibleProjects.length}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
      />
      <ProjectGrid projects={pageItems} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  )
}

export default Dashboard
