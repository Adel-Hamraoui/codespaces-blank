import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { CtaBand } from '@/frontend/components/sections/CtaBand'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { ServiceIcon } from '@/frontend/components/ui/ServiceIcon'
import { isConfirmed } from '@/frontend/lib/claims'
import type { Sector, SiteChrome } from '@/shared/types/content'
import styles from './SectorsView.module.css'

export function SectorsView({ chrome, sectors }: { chrome: SiteChrome; sectors: Sector[] }) {
  const { settings, claims } = chrome
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
      >
        {sectors.length > 1 && (
          <nav aria-label="Aller au secteur" className={styles.jump}>
            <ul>
              {sectors.map((s) => (
                <li key={s.slug}>
                  <a href={`#${s.slug}`}>{s.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageHero>

      <section className="section" aria-label="Secteurs">
        <div className={`container ${styles.list}`}>
          {sectors.map((s) => (
            <article key={s.slug} id={s.slug} className={styles.sector} aria-labelledby={`${s.slug}-titre`}>
              <div className={styles.head}>
                <span className={styles.icon}>
                  <ServiceIcon name={s.icon} size={26} />
                </span>
                <h2 id={`${s.slug}-titre`} className={styles.title}>
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
                  {s.examples.length > 0 && (
                    <ul className="check-list">
                      {s.examples.map((e) => (
                        <li key={e}>
                          <Check size={18} aria-hidden="true" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.services.length > 0 && (
                    <ul className={styles.links}>
                      {s.services.map((v) => (
                        <li key={v.slug}>
                          <Link href={`/prestations/${v.slug}`} className="link-arrow">
                            {v.name} <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        location="secteurs-final"
        title="Votre activité a des contraintes particulières ?"
        text="Horaires, accès, sécurité, hygiène : décrivez-les dans votre demande, la proposition en tiendra compte."
        phone={settings.phone}
        email={settings.email}
        freeQuote={isConfirmed(claims, 'freeQuote')}
      />
    </>
  )
}
