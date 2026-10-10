export const ROUTES = {
  registration: '/',
  signIn: '/sign-in',
  qr: '/qr',
  qrPattern: '/qr/:userId',
  qrForUser: (userId: string) => `/qr/${encodeURIComponent(userId)}`,
  scanner: '/scanner',
  entry: '/entry',
  spin: '/spin',
} as const
