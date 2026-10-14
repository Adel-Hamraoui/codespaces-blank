import {
  Building2,
  Store,
  Factory,
  PanelsTopLeft,
  HardHat,
  Droplets,
  Layers,
  FlaskConical,
  Waves,
  Route,
  Flame,
  Truck,
  Building,
  Landmark,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '@/content/service-index'

const map: Record<IconName, LucideIcon> = {
  building: Building2,
  store: Store,
  factory: Factory,
  facade: PanelsTopLeft,
  hardhat: HardHat,
  droplets: Droplets,
  layers: Layers,
  flask: FlaskConical,
  waves: Waves,
  road: Route,
  flame: Flame,
  truck: Truck,
  city: Building,
  landmark: Landmark,
  medical: Stethoscope,
}

export function ServiceIcon({ name, size = 22 }: { name: IconName; size?: number }) {
  const Icon = map[name]
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" focusable="false" />
}
