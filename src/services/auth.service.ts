import { api } from '../api/axiosInstance'
import { endpoints } from '../api/endpoints'
import { readTokenResponse, saveTokens } from '../api/token'

export type LoginCredentials = { email: string; password: string }

export async function login(payload: LoginCredentials) {
  const response = await api.post(endpoints.login, payload)
  const tokens = readTokenResponse(response.data)
  saveTokens(tokens.accessToken, tokens.refreshToken)
  return tokens
}
