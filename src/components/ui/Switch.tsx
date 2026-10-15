import { useId, type ReactNode } from 'react'
import styles from './Switch.module.css'

interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Taller 52px row, for the mobile sheet. */
  large?: boolean
  /** A decorative cue shown after the label (aria-hidden). */
  adornment?: ReactNode
}

/** A real checkbox with role="switch"; the whole row is the hit area, the track is drawn. */
export function Switch({ label, checked, onChange, large, adornment }: SwitchProps) {
  const id = useId()
  return (
    <label htmlFor={id} className={large ? `${styles.row} ${styles.large}` : styles.row}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.label}>
        {label}
        {adornment && (
          <span className={styles.adornment} aria-hidden="true">
            {adornment}
          </span>
        )}
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </label>
  )
}
