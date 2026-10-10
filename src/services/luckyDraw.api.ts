import { api } from '../api/axiosInstance'
import { endpoints } from '../api/endpoints'

export type LuckyDrawParticipant = {
  id: string
  fullName: string
  mobileNumber: string
  profilePicture: string | null
}

export type LuckyDrawEligibleResponse = {
  success: true
  drawDate: string
  eligibleCount: number
  latestWinner: LuckyDrawParticipant | null
}

export type LuckyDrawSpinResponse = {
  success: true
  drawDate: string
  winner: LuckyDrawParticipant
}

export const luckyDrawApi = {
  async getEligible(adminUserId: string): Promise<LuckyDrawEligibleResponse> {
    const response = await api.get<LuckyDrawEligibleResponse>(endpoints.luckyDrawEligible, {
      params: { adminUserId },
    })
    return response.data
  },

  async spin(adminUserId: string): Promise<LuckyDrawSpinResponse> {
    const response = await api.post<LuckyDrawSpinResponse>(endpoints.luckyDrawSpin, {
      adminUserId,
    })
    return response.data
  },
}
