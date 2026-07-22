function ProjectCard({ project }) {
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
      <p className="project-card-desc">{project.project_desc}</p>
      <a href={project.project_link} target="_blank" rel="noreferrer">
        Visit project
      </a>
    </div>
  )
}

export default ProjectCard
