import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, Phone } from 'lucide-react'
import { PageHero } from '@/components/sections/PageHero'
import { MethodSteps } from '@/components/sections/MethodSteps'
import { FaqList } from '@/components/sections/FaqList'
import { CtaBand } from '@/components/sections/CtaBand'
import { PhotoSlot } from '@/components/ui/PhotoSlot'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { JsonLd } from '@/components/seo/JsonLd'
import { claims, company } from '@/content/site'
import { getService, services } from '@/content/services'
import { pageMetadata, serviceJsonLd } from '@/lib/seo'
import styles from './page.module.css'

type Params = { slug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return {}
  return pageMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/prestations/${service.slug}`,
  })
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  const path = `/prestations/${service.slug}`
  const quoteHref = `/devis?prestation=${service.slug}`

  // Points inclus + affirmations confirmées associées à la prestation.
  const includes = [
    ...service.includes,
    ...(service.includesClaims ?? []).filter((k) => claims[k].confirmed).map((k) => claims[k].title),
  ]

  // Réponses de FAQ enrichies uniquement par des affirmations confirmées.
  const faq = service.faq.map((f) => ({
    question: f.question,
    answer:
      f.claimAddendum && claims[f.claimAddendum].confirmed
        ? `${f.answer} ${claims[f.claimAddendum].text}`
        : f.answer,
  }))

  const related = service.related.map(getService).filter((s) => s !== undefined)

  const visual = service.image ? (
    <div className={styles.photo}>
      <Image
        src={service.image.src}
        alt={service.image.alt}
        sizes="(min-width: 1024px) 42vw, (min-width: 640px) 90vw, 100vw"
        loading="eager"
        fetchPriority="high"
        quality={70}
        placeholder="blur"
        className={styles.photoImg}
      />
    </div>
  ) : (
    <PhotoSlot icon={service.icon} brief={service.photoBrief} label={service.name} />
  )

  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Prestations', path: '/prestations' },
          { name: service.name, path },
        ]}
        kicker={company.serviceArea.short}
        title={service.h1}
        lead={service.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        aside={visual}
      >
        <Link href={quoteHref} className="btn btn-lg" data-track="cta_devis_click" data-track-location={`service-${service.slug}`}>
          Demander un devis <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <a href={company.phone.href} className="btn btn-secondary btn-lg" data-track-location={`service-${service.slug}`}>
          <Phone size={18} aria-hidden="true" /> {company.phone.display}
        </a>
      </PageHero>

      {/* ---------- Contenu de la prestation ---------- */}
      {service.groups ? (
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
                <article key={g.id} id={g.id} className={`card ${styles.group}`}>
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
                {includes.map((p) => (
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
            <aside className={styles.forWhom} aria-labelledby="pour-qui">
              <h2 id="pour-qui" className={styles.forWhomTitle}>
                Pour quels locaux ?
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
          </div>
        </section>
      )}

      {/* ---------- Organisation ---------- */}
      <section className="section bg-navy on-dark" aria-labelledby="organisation">
        <div className="container">
          <SectionHeading
            id="organisation"
            kicker="Organisation"
            title="Comment l’intervention est organisée"
          />
          <MethodSteps steps={service.howItWorks} />
        </div>
      </section>

      {/* ---------- FAQ de la prestation ---------- */}
      {faq.length > 0 && (
        <section className="section" aria-labelledby="questions">
          <div className={`container ${styles.faqGrid}`}>
            <SectionHeading id="questions" kicker="Questions fréquentes" title={`${service.name} : vos questions`} />
            <FaqList items={faq} />
          </div>
        </section>
      )}

      {/* ---------- Prestations liées ---------- */}
      <section className="section-tight bg-mist" aria-labelledby="liees">
        <div className="container">
          <h2 id="liees" className={styles.relatedTitle}>
            Prestations complémentaires
          </h2>
          <ul className={styles.related}>
            {related.map((r) => (
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

      <CtaBand
        location={`service-${service.slug}-final`}
        serviceSlug={service.slug}
        title={`Un devis pour : ${service.name.toLowerCase()}`}
        text="Indiquez la ville de vos locaux, leur surface approximative et la fréquence souhaitée : nous revenons vers vous pour organiser une visite."
      />

      <JsonLd data={serviceJsonLd({ name: service.h1, description: service.metaDescription, path })} />
    </>
  )
}
