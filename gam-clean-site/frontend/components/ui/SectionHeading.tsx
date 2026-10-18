import type { ReactNode } from 'react'
import { Sparkle } from './Sparkle'

type Props = {
  kicker?: string
  title: ReactNode
  lead?: ReactNode
  center?: boolean
  id?: string
  as?: 'h1' | 'h2'
}

export function SectionHeading({ kicker, title, lead, center, id, as: Tag = 'h2' }: Props) {
  return (
    <div className={`section-head${center ? ' section-head-center' : ''}`}>
      {kicker && (
        <p className="kicker">
          <Sparkle size={11} />
          {kicker}
        </p>
      )}
      <Tag id={id}>{title}</Tag>
      {lead && <p className="lead">{lead}</p>}
    </div>
  )
}
