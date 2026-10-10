export const endpoints = {
  login: '/api/user/login',
  currentUser: '/api/user/auth/me',
  clients: '/api/clients',
  refresh: import.meta.env.VITE_API_REFRESH_PATH as string | undefined,
  users: '/users',
  userSignIn: '/users/sign-in',
  user: (id: string | number) => `/users/${encodeURIComponent(id)}`,
  eventPass: (id: string | number) => `/users/${encodeURIComponent(id)}/event-pass.pdf`,
  scanEntry: '/key-show-entry/scan',
  luckyDrawEligible: '/lucky-draw/eligible',
  luckyDrawSpin: '/lucky-draw/spin',
} as const
