import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBand } from '@/components/sections/CtaBand'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { sectors } from '@/content/sectors'
import { getService } from '@/content/services'
import { pageMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = pageMetadata({
  title: 'Secteurs d’intervention : bureaux, commerces, industrie',
  description:
    'Bureaux, commerces et ERP, industrie, copropriétés, collectivités, santé : comment GAM CLEAN adapte ses prestations à chaque secteur.',
  path: '/secteurs',
})

export default function SecteursPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Secteurs', path: '/secteurs' }]}
        kicker="Secteurs d’intervention"
        title="Une prestation adaptée à chaque environnement"
        lead={
          <p>
            Un open space, une boutique, un entrepôt ou les parties communes d’une copropriété n’ont pas les mêmes
            contraintes. Voici comment nous les prenons en compte.
          </p>
        }
      />

      <section className="section" aria-label="Secteurs">
        <div className={`container ${styles.list}`}>
          {sectors.map((s) => (
            <article key={s.id} id={s.id} className={styles.sector} aria-labelledby={`${s.id}-titre`}>
              <div className={styles.head}>
                <span className={styles.icon}>
                  <ServiceIcon name={s.icon} size={26} />
                </span>
                <h2 id={`${s.id}-titre`} className={styles.title}>
                  {s.name}
                </h2>
              </div>
              <div className={styles.body}>
                <div>
                  <h3 className={styles.label}>Vos enjeux</h3>
                  <p>{s.challenge}</p>
                  <h3 className={styles.label}>Notre réponse</h3>
                  <p>{s.approach}</p>
                </div>
                <div>
                  <ul className="check-list">
                    {s.examples.map((e) => (
                      <li key={e}>
                        <Check size={18} aria-hidden="true" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className={styles.links}>
                    {s.services.map((slug) => {
                      const service = getService(slug)
                      return service ? (
                        <li key={slug}>
                          <Link href={`/prestations/${slug}`} className="link-arrow">
                            {service.name} <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        location="secteurs-final"
        title="Votre activité a des contraintes particulières ?"
        text="Horaires, accès, sécurité, hygiène : décrivez-les dans votre demande, la proposition en tiendra compte."
      />
    </>
  )
}
