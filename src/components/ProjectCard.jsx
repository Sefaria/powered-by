import { useState } from 'react'
import ProjectDetailModal from './ProjectDetailModal.jsx'

function ProjectCard({ project }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleCardClick() {
    if (window.getSelection().toString()) return
    setIsOpen(true)
  }

  function handleCardKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick()
    }
  }

  return (
    <>
      <div
        className="project-card"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
      >
        <h3 className="project-card-title">{project.project_name}</h3>
      </div>
      {isOpen && <ProjectDetailModal project={project} onClose={() => setIsOpen(false)} />}
    </>
  )
}

export default ProjectCard
