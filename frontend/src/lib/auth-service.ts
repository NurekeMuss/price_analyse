import axiosInstance from "./axios"
import axios from "axios"

export interface RegisterData {
  email: string
  first_name: string
  last_name: string
  password_hash: string
  role?: "user" | "admin"
  is_blocked?: boolean
}

export interface LoginData {
  username: string // Using email as username
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  refresh_token: string
  user_id: number // Added user_id from the response
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "user" | "admin"
  is_blocked: boolean
  created_at: string
}

const AuthService = {
  async register(data: RegisterData): Promise<boolean> {
    try {
      await axiosInstance.post("/auth/register", data)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      }
      throw error
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Convert to form data for login endpoint
      const formData = new URLSearchParams()
      formData.append("username", data.username)
      formData.append("password", data.password)

      const response = await axiosInstance.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      // Store tokens
      const { access_token, refresh_token, user_id } = response.data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      // Store user_id if it's in the response
      if (user_id) {
        localStorage.setItem("user_id", user_id.toString())
      }

      return response.data
    } catch (error) {
      console.error("Login error:", error)
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      }
      throw error
    }
  },

  async logout(): Promise<void> {
    try {
      // Try to call the logout endpoint if it exists
      await axiosInstance.post("/auth/logout").catch(() => {
        // Ignore errors if the endpoint doesn't exist
        console.log("Logout endpoint not available, clearing local storage only")
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear tokens and user data regardless of API response
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      localStorage.removeItem("user_id")
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get user_id from localStorage
      const userId = localStorage.getItem("user_id")

      if (!userId) {
        console.error("No user ID found in localStorage")
        return null
      }

      // Get user from API using the numeric ID
      const response = await axiosInstance.get(`/users/${userId}`)

      // Store user data in localStorage for offline access
      localStorage.setItem("user", JSON.stringify(response.data))

      return response.data
    } catch (error) {
      console.error("Get current user error:", error)

      // If API call fails, try to get from localStorage as fallback
      const userJson = localStorage.getItem("user")
      if (userJson) {
        return JSON.parse(userJson)
      }

      return null
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token")
  },
}

export default AuthService
