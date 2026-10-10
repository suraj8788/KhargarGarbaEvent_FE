export type Patient = {
  _id: string
  clientId?: string | null
  name: string
  age?: number | null
  gender?: string | null
  phoneNumber?: string | null
  reportsCount?: number
  isActive?: boolean
  createdAt?: string
}

export type PatientsResponse = {
  success: boolean
  clients: {
    totalItems: number
    totalPages: number
    currentPage: number
    items: Patient[]
  }
  message?: string
}
