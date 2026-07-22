import { useEffect, useRef, useState } from 'react'

function ProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const descRef = useRef(null)

  useEffect(() => {
    const el = descRef.current
    if (el && el.scrollHeight > el.clientHeight) {
      setIsOverflowing(true)
    }
  }, [])

  return (
    <div className="project-card">
      {project.image_url && (
        <img
          className="project-card-image"
          src={project.image_url}
          alt={`${project.project_name} logo`}
        />
      )}
      <h3>{project.project_name}</h3>
      <span className="project-card-category">{project.primaryCategory}</span>
      <p ref={descRef} className={expanded ? '' : 'clamped'}>
        {project.project_desc}
      </p>
      {isOverflowing && (
        <button
          type="button"
          className="project-card-toggle"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'view less' : 'view more'}
        </button>
      )}
      <a href={project.project_link} target="_blank" rel="noreferrer">
        Visit project
      </a>
    </div>
  )
}

export default ProjectCard
