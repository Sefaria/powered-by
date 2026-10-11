import type { ReactNode } from 'react'
import { CodeXml } from 'lucide-react'
import { formatReach } from '../../lib/reach'
import { formatDate } from '../../lib/format'
import { detailTopics, type Project } from '../../lib/project'
import { ButtonLink } from '../../components/ui/Button'
import { Tag } from '../../components/ui/Tag'
import styles from './ProjectDetail.module.css'

interface ProjectDetailProps {
  project: Project
  /** Id for the title, so the surrounding dialog can label itself with it. */
  titleId: string
  /**
   * Whether the primary "Open {project}" CTA sits in the content (desktop) or
   * is rendered elsewhere (the sticky mobile footer, see {@link PrimaryCta}).
   */
  inlineCta: boolean
}

/** Helper line under the primary CTA. */
function ctaHelperText(project: Project, compact: boolean): string | null {
  if (!project.domain) return null
  return compact ? `${project.domain} · opens in a new tab` : `Opens ${project.domain} in a new tab`
}

export function PrimaryCta({ project, compact }: { project: Project; compact?: boolean }) {
  if (!project.url) return null
  const helper = ctaHelperText(project, compact ?? false)
  return (
    <div className={styles.primaryCta}>
      <ButtonLink variant="accent" size="xl" fullWidth href={project.url}>
        Open {project.name}
      </ButtonLink>
      {helper && <p className={styles.helper}>{helper}</p>}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt className={styles.dt}>{label}</dt>
      <dd className={styles.dd}>{children}</dd>
    </div>
  )
}

/** The dialog's content. Sections with no data are omitted, never rendered empty. */
export function ProjectDetail({ project, titleId, inlineCta }: ProjectDetailProps) {
  const topics = detailTopics(project)
  const hasCtaBlock = (inlineCta && project.url !== null) || project.sourceUrl !== null
  const hasDetails =
    project.resources.length > 0 ||
    project.builtWith !== null ||
    topics.length > 0 ||
    project.reach !== null ||
    project.submittedAt !== null

  return (
    <div className={styles.root}>
      <h2 id={titleId} className={styles.title}>
        {project.name}
      </h2>
      {project.description && <p className={styles.description}>{project.description}</p>}

      {hasCtaBlock && (
        <div className={styles.ctaBlock}>
          {inlineCta && <PrimaryCta project={project} />}
          {project.sourceUrl && (
            <div className={styles.source}>
              <ButtonLink
                variant="accent-outline"
                href={project.sourceUrl}
                arrow={false}
                icon={<CodeXml size={18} strokeWidth={2} aria-hidden="true" />}
              >
                View source code
              </ButtonLink>
            </div>
          )}
        </div>
      )}

      {project.backstory && (
        <section className={styles.backstory}>
          <h3 className={styles.label}>Project Backstory</h3>
          <p className={styles.description}>{project.backstory}</p>
        </section>
      )}

      {hasDetails && (
        <dl className={styles.details}>
          {project.resources.length > 0 && (
            <DetailRow label="Sefaria resources used">
              <ul className={styles.tags}>
                {project.resources.map((resource) => (
                  <li key={resource}>
                    <Tag variant="resource">{resource}</Tag>
                  </li>
                ))}
              </ul>
            </DetailRow>
          )}
          {project.builtWith && <DetailRow label="Built with">{project.builtWith}</DetailRow>}
          {topics.length > 0 && (
            <DetailRow label="Topics">
              <ul className={styles.tags}>
                {topics.map((topic) => (
                  <li key={topic}>
                    <Tag variant="topic">{topic}</Tag>
                  </li>
                ))}
              </ul>
            </DetailRow>
          )}
          {project.reach && (
            <DetailRow label="Reported reach">
              {formatReach(project.reach)}{' '}
              <span className={styles.suffix}>· approximate, self-reported</span>
            </DetailRow>
          )}
          {project.submittedAt && (
            <DetailRow label="Submitted">{formatDate(project.submittedAt)}</DetailRow>
          )}
        </dl>
      )}
    </div>
  )
}
