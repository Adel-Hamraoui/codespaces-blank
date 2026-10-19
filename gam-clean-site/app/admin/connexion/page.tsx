import type { Metadata } from 'next'
import { loginAction } from '@/backend/actions/auth'
import { getSiteChrome } from '@/backend/modules/content/public'
import { LoginView } from '@/frontend/views/admin/LoginView'

export const metadata: Metadata = { title: 'Connexion' }

// La page lit l'adresse demandée avant la connexion (paramètre « suite ») : son
// affichage peut attendre le serveur, comme le reste du back-office.
export const instant = false

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function LoginPage({ searchParams }: Props) {
  const [sp, { settings }] = await Promise.all([searchParams, getSiteChrome()])
  return (
    <LoginView
      action={loginAction}
      next={typeof sp.suite === 'string' ? sp.suite : null}
      loggedOut={sp.deconnecte === '1'}
      brandName={settings.companyName}
    />
  )
}
