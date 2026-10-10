export const queryKeys = {
  registeredUser: ['registered-user'] as const,
  user: (userId: string) => ['user', userId] as const,
}
