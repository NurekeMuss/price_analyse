"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  )
}

