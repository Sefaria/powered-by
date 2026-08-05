import { useState } from 'react'
import { getCategoryColor } from '../utils/categories.js'
import { getScreenshotUrl } from '../utils/screenshots.js'

function ProjectCard({ project }) {
  const [flipped, setFlipped] = useState(false)
  const screenshotUrl = getScreenshotUrl(project.id)

  function handleCardClick() {
    if (window.getSelection().toString()) return
    setFlipped((current) => !current)
  }

  return (
    <div className="project-card" onClick={handleCardClick}>
      <div className={`project-card-inner${flipped ? ' flipped' : ''}`}>
        <div
          className={`project-card-front${screenshotUrl ? ' has-screenshot' : ''}`}
          style={screenshotUrl ? { backgroundImage: `url(${screenshotUrl})` } : undefined}
        >
          <a
            className="project-card-title"
            href={project.project_link}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {project.project_name}
          </a>
        </div>
        <div className="project-card-back">
          <div className="project-card-categories">
            {project.categories.map((category) => (
              <span
                key={category}
                className="project-card-category"
                style={{ '--category-color': getCategoryColor(category) }}
              >
                {category}
              </span>
            ))}
          </div>
          <p className="project-card-desc">{project.project_desc}</p>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
