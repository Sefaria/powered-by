import { ExternalLink } from '../ui/ExternalLink'
import { Container } from './Container'
import { DEVELOPERS_URL, DONATE_URL, SEFARIA_URL } from './SiteHeader'
import styles from './SiteFooter.module.css'

// Link target only; the visible copy never mentions the form provider.
export const SUBMIT_URL = 'https://sefaria.formstack.com/forms/powered_by_sefaria_submission_form'

const LINKS = [
  { label: 'Sefaria.org', href: SEFARIA_URL },
  { label: 'Developer Portal', href: DEVELOPERS_URL },
  { label: 'Sefaria on GitHub', href: 'https://github.com/Sefaria' },
  { label: 'Submit a project', href: SUBMIT_URL },
  { label: 'Donate', href: DONATE_URL },
] as const

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.about}>
          <p className={styles.title}>Powered by Sefaria</p>
          <p className={styles.body}>
            A showcase of independent projects built with Sefaria&rsquo;s free texts, API, and data.
            Each project is created and maintained by its own developers.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {LINKS.map((link) => (
              <li key={link.href} className={styles.item}>
                <ExternalLink href={link.href} className={styles.link}>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  )
}
