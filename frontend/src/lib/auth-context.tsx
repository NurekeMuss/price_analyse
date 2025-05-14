"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthService, { type User, type LoginData, type RegisterData } from "./auth-service"
import UserService from "./user-service"
import toast from "react-hot-toast"

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => Promise<boolean>
  logout: () => void
  loading: boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      try {
        // Check if we have a token
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser()
          if (userData) {
            setUser(userData)
          } else {
            // If we have a token but can't get user data, tokens might be invalid
            await AuthService.logout()
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Modify the login function to not store user in localStorage
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const loginData: LoginData = {
        username: email, // API expects username field but uses email
        password,
      }

      const authResponse = await AuthService.login(loginData)

      if (authResponse.access_token) {
        // Fetch the user data after successful login
        const userData = await AuthService.getCurrentUser()
        if (userData) {
          setUser(userData)
          setLoading(false)
          return true
        } else {
          // If we couldn't get user data, create a basic user object
          // This is a fallback in case the API doesn't return user_id or the getCurrentUser fails
          const basicUser: User = {
            id: 0,
            email: email,
            first_name: "",
            last_name: "",
            role: "user",
            is_blocked: false,
            created_at: new Date().toISOString(),
          }
          setUser(basicUser)
          setLoading(false)
          return true
        }
      }

      throw new Error("Failed to get access token")
    } catch (error) {
      console.error("Login error:", error)
      setLoading(false)
      return false
    }
  }

  // Register function
  const register = async (data: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => {
    setLoading(true)
    try {
      const registerData: RegisterData = {
        email: data.email,
        password_hash: data.password, // API expects password_hash
        first_name: data.first_name,
        last_name: data.last_name,
        role: "user", // Default role
      }

      await AuthService.register(registerData)

      // After registration, log the user in
      const loginSuccess = await login(data.email, data.password)
      return loginSuccess
    } catch (error) {
      console.error("Registration error:", error)
      setLoading(false)
      return false
    }
  }

  // Modify the logout function to not clear user from localStorage
  const logout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error during logout")
    }
  }

  // Check if the current user is an admin
  const isAdmin = () => {
    if (!user) return false
    return user.role === "admin" || UserService.isAdmin()
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
