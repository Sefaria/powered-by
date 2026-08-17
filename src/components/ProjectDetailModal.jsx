import { useEffect, useRef, useState } from 'react'
import { getCategoryColor } from '../utils/categories.js'
import { formatDate, hasValue, isSafeUrl } from '../utils/projectDetail.js'
import { getPreviewUrl } from '../utils/projectPreview.js'

function ProjectDetailModal({ project, onClose }) {
  const modalRef = useRef(null)
  const previewUrl = getPreviewUrl(project)
  const [previewState, setPreviewState] = useState('loading')

  useEffect(() => {
    if (!previewUrl) return
    const timer = setTimeout(() => {
      setPreviewState((current) => (current === 'loading' ? 'failed' : current))
    }, 6000)
    return () => clearTimeout(timer)
  }, [previewUrl])

  function handlePreviewLoad() {
    setPreviewState('loaded')
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement
    modalRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

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
      <div
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-label={project.project_name}
        tabIndex={-1}
        ref={modalRef}
      >
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

        {hasValue(project.categories) && (
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

        {(hasValue(project.project_desc) || hasValue(project.project_why)) && (
          <div className="project-modal-section">
            {hasValue(project.project_desc) && <p>{project.project_desc}</p>}
            {hasValue(project.project_why) && (
              <p>
                <strong>Why this project: </strong>
                {project.project_why}
              </p>
            )}
          </div>
        )}

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
                {project.sefaria_tools_used
                  .filter((tool) => typeof tool === 'string')
                  .map((tool) => (
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

        {(isSafeUrl(project.project_link) || isSafeUrl(project.project_source_code)) && (
          <div className="project-modal-links">
            {isSafeUrl(project.project_link) && (
              <a href={project.project_link} target="_blank" rel="noreferrer">
                Visit project
              </a>
            )}
            {isSafeUrl(project.project_source_code) && (
              <a href={project.project_source_code} target="_blank" rel="noreferrer">
                Source code
              </a>
            )}
          </div>
        )}

        {previewUrl && (
          <div className="project-modal-section">
            <h3 className="project-modal-preview-heading">Live preview</h3>
            {previewState !== 'failed' && (
              <iframe
                className={`project-modal-preview-frame${previewState === 'loading' ? ' is-hidden' : ''}`}
                src={previewUrl}
                title={`Live preview of ${project.project_name}`}
                sandbox="allow-scripts allow-same-origin allow-forms"
                referrerPolicy="no-referrer"
                onLoad={handlePreviewLoad}
              />
            )}
            {previewState === 'loading' && (
              <p className="project-modal-preview-status">Loading preview…</p>
            )}
            {previewState === 'failed' && (
              <p className="project-modal-preview-status">Preview not available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailModal
