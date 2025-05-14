import axiosInstance from "./axios"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  password_hash?: string
  role: "user" | "admin"
  is_blocked: boolean
  created_at: string
}

export interface CreateUserData {
  email: string
  first_name: string
  last_name: string
  password_hash: string
  role?: "user" | "admin"
  is_blocked?: boolean
}

export interface UpdateUserData {
  email?: string
  first_name?: string
  last_name?: string
  password_hash?: string
  role?: "user" | "admin"
  is_blocked?: boolean
}

const UserService = {
  async getUsers(skip = 0, limit = 100): Promise<User[]> {
    try {
      const response = await axiosInstance.get(`/users/?skip=${skip}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  async getUser(id: number): Promise<User> {
    try {
      const response = await axiosInstance.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  async createUser(data: CreateUserData): Promise<User> {
    try {
      const response = await axiosInstance.post("/users/", data)
      return response.data
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/users/${id}`)
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },

  // Helper function to parse JWT token and extract user role
  parseJwt(token: string): { role: string } | null {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error parsing JWT token:", error)
      return null
    }
  },

  // Check if the current user is an admin
  isAdmin(): boolean {
    const token = localStorage.getItem("access_token")
    if (!token) return false

    const decoded = this.parseJwt(token)
    return decoded?.role === "admin"
  },
}

export default UserService
