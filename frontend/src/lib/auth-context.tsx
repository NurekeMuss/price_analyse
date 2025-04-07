"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  surname: string
  login: string
  role: "user" | "admin"
}

type AuthContextType = {
  user: User | null
  login: (login: string, password: string) => Promise<boolean>
  register: (data: {
    login: string
    password: string
    name: string
    surname: string
  }) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Simulate checking for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Simulate login
  const login = async (login: string, password: string) => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo users
    if (login === "user" && password === "password") {
      const user = {
        id: "1",
        name: "John",
        surname: "Doe",
        login: "user",
        role: "user" as const,
      }
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      setLoading(false)
      return true
    } else if (login === "admin" && password === "password") {
      const admin = {
        id: "2",
        name: "Admin",
        surname: "User",
        login: "admin",
        role: "admin" as const,
      }
      setUser(admin)
      localStorage.setItem("user", JSON.stringify(admin))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  // Simulate registration
  const register = async (data: {
    login: string
    password: string
    name: string
    surname: string
  }) => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name: data.name,
      surname: data.surname,
      login: data.login,
      role: "user" as const,
    }

    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    setLoading(false)
    return true
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

