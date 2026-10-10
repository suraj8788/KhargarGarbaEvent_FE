import { api } from '../api/axiosInstance'
import { endpoints } from '../api/endpoints'

export type ScanEntryResponse = {
  success: true
  status: 'entered' | 'already_entered'
  message: string
  user: {
    id: string
    fullName: string
  }
}

export const entryApi = {
  async scan(qrValue: string, scannerUserId: string): Promise<ScanEntryResponse> {
    const response = await api.post<ScanEntryResponse>(endpoints.scanEntry, {
      qrValue,
      scannerUserId,
    })
    return response.data
  },
}
