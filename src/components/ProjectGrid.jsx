import ProjectCard from './ProjectCard.jsx'

function ProjectGrid({ projects }) {
  if (projects.length === 0) {
    return <p className="empty-state">No projects match your search.</p>
  }

  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

export default ProjectGrid
