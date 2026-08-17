import { useState } from 'react'
import ProjectDetailModal from './ProjectDetailModal.jsx'

function ProjectCard({ project }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleCardClick() {
    if (window.getSelection().toString()) return
    setIsOpen(true)
  }

  return (
    <>
      <div className="project-card" onClick={handleCardClick}>
        <h3 className="project-card-title">{project.project_name}</h3>
        <p className="project-card-snippet">{project.project_desc}</p>
      </div>
      {isOpen && <ProjectDetailModal project={project} onClose={() => setIsOpen(false)} />}
    </>
  )
}

export default ProjectCard
