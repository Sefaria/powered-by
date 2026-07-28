function ProjectCard({ project }) {
  return (
    <a
      className="project-card"
      href={project.project_link}
      target="_blank"
      rel="noreferrer"
    >
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
          <span key={category} className="project-card-category">
            {category}
          </span>
        ))}
      </div>
      <p className="project-card-desc">{project.project_desc}</p>
    </a>
  )
}

export default ProjectCard
