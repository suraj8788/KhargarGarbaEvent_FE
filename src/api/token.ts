const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveTokens(accessToken: string, refreshToken?: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  else sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function readTokenResponse(value: unknown): { accessToken: string; refreshToken?: string } {
  if (!value || typeof value !== 'object') throw new Error('Invalid login response.')
  const root = value as Record<string, unknown>
  const payload = root.data && typeof root.data === 'object'
    ? root.data as Record<string, unknown>
    : root
  const accessToken = payload.accessToken ?? payload.token
  const refreshToken = payload.refreshToken
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('The API response did not include an access token.')
  }
  return {
    accessToken,
    refreshToken: typeof refreshToken === 'string' ? refreshToken : undefined,
  }
}
