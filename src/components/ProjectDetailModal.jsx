import { useEffect } from 'react'
import { getCategoryColor } from '../utils/categories.js'
import { formatDate, hasValue } from '../utils/projectDetail.js'

function ProjectDetailModal({ project, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose()
  }

  const showDetails =
    hasValue(project.tech_used_raw) ||
    hasValue(project.sefaria_tools_used) ||
    hasValue(project.technical_experience) ||
    hasValue(project.project_reach)

  const showBadges = project.vibe_coded === true || project.is_buggy === true

  const metaParts = [
    hasValue(project.submission_date) && `Submitted ${formatDate(project.submission_date)}`,
    hasValue(project.submission_source) && `via ${project.submission_source}`,
    hasValue(project.created_at) && `Created ${formatDate(project.created_at)}`,
    hasValue(project.updated_at) && `Updated ${formatDate(project.updated_at)}`,
  ].filter(Boolean)

  return (
    <div className="project-modal-backdrop" onClick={handleBackdropClick}>
      <div className="project-modal" role="dialog" aria-modal="true" aria-label={project.project_name}>
        <button type="button" className="project-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {hasValue(project.image_url) && (
          <img
            className="project-modal-image"
            src={project.image_url}
            alt={`${project.project_name} screenshot`}
          />
        )}

        <h2 className="project-modal-title">{project.project_name}</h2>

        {project.categories.length > 0 && (
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
        )}

        <div className="project-modal-section">
          {hasValue(project.project_desc) && <p>{project.project_desc}</p>}
          {hasValue(project.project_why) && (
            <p>
              <strong>Why this project: </strong>
              {project.project_why}
            </p>
          )}
        </div>

        {showDetails && (
          <div className="project-modal-section">
            {hasValue(project.tech_used_raw) && (
              <p>
                <strong>Tech used: </strong>
                {project.tech_used_raw}
              </p>
            )}
            {hasValue(project.sefaria_tools_used) && (
              <div className="project-modal-tags">
                {project.sefaria_tools_used.map((tool) => (
                  <span key={tool} className="project-card-category">
                    {tool}
                  </span>
                ))}
              </div>
            )}
            {hasValue(project.technical_experience) && (
              <p>
                <strong>Technical experience: </strong>
                {project.technical_experience}
              </p>
            )}
            {hasValue(project.project_reach) && (
              <p>
                <strong>Reach: </strong>
                {project.project_reach}
              </p>
            )}
          </div>
        )}

        {showBadges && (
          <div className="project-modal-badges">
            {project.vibe_coded === true && (
              <span className="project-modal-badge">Vibe-coded</span>
            )}
            {project.is_buggy === true && (
              <span className="project-modal-badge project-modal-badge-warning">Known bugs</span>
            )}
          </div>
        )}

        {metaParts.length > 0 && <p className="project-modal-meta">{metaParts.join(' · ')}</p>}

        <div className="project-modal-links">
          {hasValue(project.project_link) && (
            <a href={project.project_link} target="_blank" rel="noreferrer">
              Visit project
            </a>
          )}
          {hasValue(project.project_source_code) && (
            <a href={project.project_source_code} target="_blank" rel="noreferrer">
              Source code
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailModal
