import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  console.warn('VITE_API_URL is not configured. Add it to the frontend environment file.')
}

export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

export function getApiErrorMessage(error: unknown, action = 'Request') {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
    if (!error.response) return 'Could not connect to the server. Please try again.'
    if (error.response.status === 409) return 'This mobile number is already registered.'
    return `${action} failed (${error.response.status}). Please try again.`
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
