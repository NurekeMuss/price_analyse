"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Lock, User } from "lucide-react"
import { TwoFactorVerification } from "@/components/two-factor-verification"

export default function LoginPage() {
  const router = useRouter()
  const { user, login, verifyTwoFactorLogin } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false)
  const [temporaryToken, setTemporaryToken] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required")
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      // Check if 2FA is required
      if ("requires_2fa" in result && result.requires_2fa) {
        setTemporaryToken(result.temporary_token)
        setShowTwoFactorVerification(true)
        toast.success("Please enter the verification code from your authenticator app")
      } else {
        toast.success("Login successful. Welcome back!")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorVerify = async (code: string) => {
    if (!code || !temporaryToken) {
      toast.error("Verification code is required")
      return
    }

    setLoading(true)

    try {
      await verifyTwoFactorLogin(temporaryToken, code)
      toast.success("Login successful. Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      console.error("2FA verification error:", error)
      toast.error("Verification failed. Invalid code")
    } finally {
      setLoading(false)
    }
  }

  if (showTwoFactorVerification) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
        <TwoFactorVerification
          onVerify={handleTwoFactorVerify}
          onCancel={() => setShowTwoFactorVerification(false)}
          loading={loading}
          title="Two-Factor Authentication"
          description="Enter the verification code from your authenticator app"
        />
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <Lock className="mr-2 h-4 w-4" />
              Facebook
            </Button>
          </div>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
