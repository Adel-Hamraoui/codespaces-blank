import { methodSteps } from '@/content/method'
import styles from './MethodSteps.module.css'

/** Déroulement d'une demande, en étapes numérotées. */
export function MethodSteps({ steps = methodSteps }: { steps?: { title: string; text: string }[] }) {
  return (
    <ol className={styles.steps} data-count={steps.length}>
      {steps.map((step, i) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className={styles.title}>{step.title}</h3>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  )
}
