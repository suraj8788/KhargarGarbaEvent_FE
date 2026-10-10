export type User = {
  id: string
  fullName: string
  gender: string
  mobileNumber: string
  role: 'USER' | 'SCANNER' | 'ADMIN'
  profilePicture: string | null
  createdAt: string
  updatedAt: string
  qrCode: string
}

export type CreateUserPayload = {
  fullName: string
  gender: string
  mobileNumber: string
  profilePicture?: string | null
}

export type UpdateUserPayload = Partial<CreateUserPayload>

export type UserResponse = {
  data?: User
  user?: User
}
