import { api } from '../api/axiosInstance'
import { endpoints } from '../api/endpoints'
import type { PatientsResponse } from '../types/patient'

export type PatientListParams = {
  page: number
  perPage: number
  search: string
}

export const patientApi = {
  async getPatients({ page, perPage, search }: PatientListParams): Promise<PatientsResponse> {
    const response = await api.get<PatientsResponse>(endpoints.clients, {
      params: { per_page: perPage, page, sortBy: '', sortOrder: 'asc', search },
    })
    return response.data
  },
}
