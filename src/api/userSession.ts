import type { User } from '../types/user'

const SIGNED_IN_USER_KEY = 'signedInUser'

export function saveSignedInUser(user: User) {
  sessionStorage.setItem(SIGNED_IN_USER_KEY, JSON.stringify(user))
}

export function getSignedInUser(): User | null {
  const storedUser = sessionStorage.getItem(SIGNED_IN_USER_KEY)
  if (!storedUser) return null

  try {
    const user = JSON.parse(storedUser) as Partial<User>
    if (typeof user.id !== 'string' || typeof user.role !== 'string') return null
    return user as User
  } catch {
    return null
  }
}
