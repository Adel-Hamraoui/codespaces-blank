// ============================================================================
// Comptes d'administration : identifiants et mots de passe.
// Règle de mot de passe : 12 caractères minimum (recommandation ANSSI / NIST :
// la longueur prime sur la complexité), 128 maximum, différent de l'e-mail.
// ============================================================================
import { ADMIN_ROLES, type AdminRole } from '../constants'
import { isEmail, isOneOf, normalizeEmail, str, type FieldErrors } from './common'

export const PASSWORD_MIN = 12
export const PASSWORD_MAX = 128

export function passwordProblem(password: string, email?: string): string | null {
  if (password.length < PASSWORD_MIN) return `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`
  if (password.length > PASSWORD_MAX) return `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX} caractères.`
  if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase()))
    return 'Le mot de passe ne doit pas contenir votre identifiant.'
  if (/^(.)\1+$/.test(password)) return 'Le mot de passe est trop simple.'
  return null
}

export function validateLogin(input: Record<string, unknown>) {
  const data = { email: normalizeEmail(input.email), password: typeof input.password === 'string' ? input.password.slice(0, PASSWORD_MAX) : '' }
  const errors: FieldErrors<'email' | 'password'> = {}
  if (!isEmail(data.email)) errors.email = 'Indiquez une adresse e-mail valide.'
  if (!data.password) errors.password = 'Indiquez votre mot de passe.'
  return { data, errors }
}

export function validateNewUser(input: Record<string, unknown>) {
  const data = {
    email: normalizeEmail(input.email),
    displayName: str(input.displayName, 80),
    role: (isOneOf(ADMIN_ROLES, input.role) ? input.role : 'sales') as AdminRole,
  }
  const errors: FieldErrors<'email' | 'displayName' | 'role'> = {}
  if (!isEmail(data.email)) errors.email = 'Adresse e-mail invalide.'
  if (data.displayName.length < 2) errors.displayName = 'Indiquez le nom de la personne.'
  return { data, errors }
}

export function validatePasswordChange(input: Record<string, unknown>, email: string) {
  const current = typeof input.currentPassword === 'string' ? input.currentPassword : ''
  const next = typeof input.newPassword === 'string' ? input.newPassword : ''
  const confirm = typeof input.confirmPassword === 'string' ? input.confirmPassword : ''
  const errors: FieldErrors<'currentPassword' | 'newPassword' | 'confirmPassword'> = {}
  if (!current) errors.currentPassword = 'Indiquez votre mot de passe actuel.'
  const problem = passwordProblem(next, email)
  if (problem) errors.newPassword = problem
  else if (next === current) errors.newPassword = 'Choisissez un mot de passe différent de l’actuel.'
  if (next !== confirm) errors.confirmPassword = 'Les deux mots de passe ne correspondent pas.'
  return { data: { current, next }, errors }
}
