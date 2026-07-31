import axiosInstance from './axiosInstance'

const BASE = '/api/auth'

const authApi = {
  /** POST /api/auth/login → { token, type, userId, name, email, role } */
  login: (email, password) =>
    axiosInstance.post(`${BASE}/login`, { email, password }),
}

export default authApi
