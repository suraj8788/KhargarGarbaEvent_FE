import { api } from '../api/axiosInstance'
import { endpoints } from '../api/endpoints'
import type { CreateUserPayload, UpdateUserPayload, User, UserResponse } from '../types/user'

function readUserResponse(body: User | UserResponse): User {
  if ('id' in body) return body
  if (body.data) return body.data
  if (body.user) return body.user
  throw new Error('The API response did not include the created user.')
}

export const userApi = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>(endpoints.users)
    return response.data
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get<User | UserResponse>(endpoints.user(id))
    return readUserResponse(response.data)
  },

  async signIn(mobileNumber: string): Promise<User> {
    const response = await api.post<User | UserResponse>(endpoints.userSignIn, {
      mobileNumber,
    })
    return readUserResponse(response.data)
  },

  async downloadEventPass(id: string): Promise<Blob> {
    const response = await api.get<Blob>(endpoints.eventPass(id), {
      responseType: 'blob',
    })
    return response.data
  },

  async createUser(data: CreateUserPayload): Promise<User> {
    const response = await api.post<User | UserResponse>(endpoints.users, data)
    return readUserResponse(response.data)
  },

  async updateUser(id: string, data: UpdateUserPayload): Promise<User> {
    const response = await api.put<User | UserResponse>(endpoints.user(id), data)
    return readUserResponse(response.data)
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(endpoints.user(id))
  },
}
