import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Phone } from 'lucide-react'
import { imageFor } from '@/frontend/assets/images'
import { CtaBand } from '@/frontend/components/sections/CtaBand'
import { FaqList } from '@/frontend/components/sections/FaqList'
import { MethodSteps } from '@/frontend/components/sections/MethodSteps'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { JsonLd } from '@/frontend/components/seo/JsonLd'
import { PhotoSlot } from '@/frontend/components/ui/PhotoSlot'
import { SectionHeading } from '@/frontend/components/ui/SectionHeading'
import { ServiceIcon } from '@/frontend/components/ui/ServiceIcon'
import { isConfirmed } from '@/frontend/lib/claims'
import { faqJsonLd, serviceJsonLd } from '@/frontend/lib/seo'
import type { Claim, Service, SiteSettings } from '@/shared/types/content'
import styles from './ServiceView.module.css'

type Props = { service: Service; settings: SiteSettings; claims: Claim[] }

export function ServiceView({ service, settings, claims }: Props) {
  const path = `/prestations/${service.slug}`
  const quoteHref = `/devis?prestation=${service.slug}`
  const image = imageFor(service.imageKey)
  const track = `service-${service.slug}`

  const visual = image ? (
    <div className={styles.photo}>
      <Image
        src={image}
        alt={service.imageAlt ?? ''}
        sizes="(min-width: 1024px) 42vw, (min-width: 640px) 90vw, 100vw"
        loading="eager"
        fetchPriority="high"
        quality={70}
        placeholder="blur"
        className={styles.photoImg}
      />
    </div>
  ) : (
    <PhotoSlot icon={service.icon} brief={service.photoBrief ?? ''} label={service.name} />
  )

  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Prestations', path: '/prestations' },
          { name: service.name, path },
        ]}
        kicker={settings.serviceArea.short}
        title={service.h1}
        lead={service.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        aside={visual}
      >
        <Link href={quoteHref} className="btn btn-lg" data-track="cta_devis_click" data-track-location={track}>
          Demander un devis <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <a href={settings.phone.href} className="btn btn-secondary btn-lg" data-track-location={track}>
          <Phone size={18} aria-hidden="true" /> {settings.phone.display}
        </a>
      </PageHero>

      {/* ---------- Contenu de la prestation ---------- */}
      {service.groups.length > 0 ? (
        <section className="section" aria-labelledby="specialites">
          <div className="container">
            <SectionHeading
              id="specialites"
              kicker="Spécialités"
              title="Les prestations spécialisées proposées"
              lead="Chaque spécialité peut faire l’objet d’une intervention ponctuelle ou d’un contrat."
            />
            <div className={styles.groups}>
              {service.groups.map((g) => (
                <article key={g.id} id={g.id} className={`card ${styles.group} reveal`}>
                  <span className="card-icon">
                    <ServiceIcon name={g.icon} />
                  </span>
                  <h3>{g.title}</h3>
                  <ul className="check-list">
                    {g.points.map((p) => (
                      <li key={p}>
                        <Check size={18} aria-hidden="true" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="section" aria-labelledby="inclus">
          <div className={`container ${styles.split}`}>
            <div>
              <SectionHeading id="inclus" kicker="La prestation" title="Ce qui est pris en charge" />
              <ul className="check-list">
                {service.includes.map((p) => (
                  <li key={p}>
                    <Check size={20} aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className={`muted ${styles.note}`}>
                Le contenu exact, la fréquence et les horaires sont précisés dans le devis, après visite de vos locaux.
              </p>
            </div>
            {service.forWhom.length > 0 && (
              <aside className={styles.forWhom} aria-labelledby="pour-qui">
                <h2 id="pour-qui" className={styles.forWhomTitle}>
                  Pour quels locaux ?
                </h2>
                <ul className="tag-list">
                  {service.forWhom.map((w) => (
                    <li key={w} className="tag">
                      {w}
                    </li>
                  ))}
                </ul>
                <Link href="/secteurs" className="link-arrow">
                  Voir les secteurs d’intervention <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </aside>
            )}
          </div>
        </section>
      )}

      {/* ---------- Organisation ---------- */}
      {service.howItWorks.length > 0 && (
        <section className="section bg-navy on-dark" aria-labelledby="organisation">
          <div className="container">
            <SectionHeading id="organisation" kicker="Organisation" title="Comment l’intervention est organisée" />
            <MethodSteps steps={service.howItWorks} />
          </div>
        </section>
      )}

      {/* ---------- FAQ de la prestation ---------- */}
      {service.faq.length > 0 && (
        <section className="section" aria-labelledby="questions">
          <div className={`container ${styles.faqGrid}`}>
            <SectionHeading id="questions" kicker="Questions fréquentes" title={`${service.name} : vos questions`} />
            <FaqList items={service.faq} />
          </div>
        </section>
      )}

      {/* ---------- Prestations liées ---------- */}
      {service.related.length > 0 && (
        <section className="section-tight bg-mist" aria-labelledby="liees">
          <div className="container">
            <h2 id="liees" className={styles.relatedTitle}>
              Prestations complémentaires
            </h2>
            <ul className={styles.related}>
              {service.related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/prestations/${r.slug}`} className={styles.relatedLink}>
                    <span className={styles.relatedIcon}>
                      <ServiceIcon name={r.icon} />
                    </span>
                    <span>
                      <span className={styles.relatedName}>{r.name}</span>
                      <span className={styles.relatedText}>{r.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand
        location={`${track}-final`}
        serviceSlug={service.slug}
        title={`Un devis pour : ${service.name.toLowerCase()}`}
        text="Indiquez la ville de vos locaux, leur surface approximative et la fréquence souhaitée : nous revenons vers vous pour organiser une visite."
        phone={settings.phone}
        email={settings.email}
        freeQuote={isConfirmed(claims, 'freeQuote')}
      />

      <JsonLd
        data={[
          serviceJsonLd({ name: service.h1, description: service.metaDescription, path }, settings),
          ...(service.faq.length > 0 ? [faqJsonLd(service.faq)] : []),
        ]}
      />
    </>
  )
}
