import type { ReactNode } from 'react'
import { formatDate } from '../../lib/format'
import { detailTopics, type Project } from '../../lib/project'
import { formatReach } from '../../lib/reach'
import { Tag } from '../../components/ui/Tag'
import styles from './ProjectDetails.module.css'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt className={styles.dt}>{label}</dt>
      <dd className={styles.dd}>{children}</dd>
    </div>
  )
}

/** Backstory and the details list. Sections and rows with no data are omitted. */
export function ProjectDetails({ project }: { project: Project }) {
  const topics = detailTopics(project)
  const hasDetails =
    project.resources.length > 0 ||
    project.builtWith !== null ||
    topics.length > 0 ||
    project.reach !== null ||
    project.submittedAt !== null

  return (
    <div className={styles.root}>
      {project.backstory && (
        <section aria-labelledby="backstory-heading">
          <h2 id="backstory-heading" className={styles.heading}>
            Project Backstory
          </h2>
          <p className={styles.backstory}>{project.backstory}</p>
        </section>
      )}
      {hasDetails && (
        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className={styles.heading}>
            Details
          </h2>
          <dl className={styles.list}>
            {project.resources.length > 0 && (
              <Row label="Sefaria resources used">
                <ul className={styles.tags}>
                  {project.resources.map((resource) => (
                    <li key={resource}>
                      <Tag variant="resource">{resource}</Tag>
                    </li>
                  ))}
                </ul>
              </Row>
            )}
            {project.builtWith && <Row label="Built with">{project.builtWith}</Row>}
            {topics.length > 0 && (
              <Row label="Topics">
                <ul className={styles.tags}>
                  {topics.map((topic) => (
                    <li key={topic}>
                      <Tag variant="topic">{topic}</Tag>
                    </li>
                  ))}
                </ul>
              </Row>
            )}
            {project.reach && (
              <Row label="Reported reach">
                {formatReach(project.reach)}{' '}
                <span className={styles.suffix}>· approximate, self-reported</span>
              </Row>
            )}
            {project.submittedAt && <Row label="Submitted">{formatDate(project.submittedAt)}</Row>}
          </dl>
        </section>
      )}
    </div>
  )
}
