import { getCategoryColor } from '../utils/categories.js'
import { getScreenshotUrl } from '../utils/screenshots.js'

function ProjectCard({ project }) {
  const screenshotUrl = getScreenshotUrl(project.id)

  return (
    <a
      className={`project-card${screenshotUrl ? ' has-screenshot' : ''}`}
      href={project.project_link}
      target="_blank"
      rel="noreferrer"
      style={screenshotUrl ? { backgroundImage: `url(${screenshotUrl})` } : undefined}
    >
      <div className="project-card-content">
        {project.image_url && (
          <img
            className="project-card-image"
            src={project.image_url}
            alt={`${project.project_name} logo`}
          />
        )}
        <h3>{project.project_name}</h3>
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
    </a>
  )
}

export default ProjectCard
