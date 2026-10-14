export type NavItem = { href: string; label: string }

/** Navigation principale (la rubrique « Prestations » s'ouvre en sous-menu). */
export const mainNav: NavItem[] = [
  { href: '/secteurs', label: 'Secteurs' },
  { href: '/a-propos', label: 'L’entreprise' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export const legalNav: NavItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
]
