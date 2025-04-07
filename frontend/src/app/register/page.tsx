"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Lock, User } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname: "",
  })

  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.login || !formData.password || !formData.confirmPassword || !formData.name || !formData.surname) {
      toast.error("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // Simulate sending verification code
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)

    // Move to step 2
    setStep(2)

    toast.success("Verification code sent. Please check your email for the verification code. (Use '123456' for demo)")
  }

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode) {
      toast.error("Verification code is required")
      return
    }

    // For demo purposes, accept any code
    if (verificationCode !== "123456") {
      toast.error("Invalid verification code")
      return
    }

    setLoading(true)

    try {
      const success = await register(formData)

      if (success) {
        toast.success("Registration successful. Your account has been created")
        router.push("/dashboard")
      } else {
        toast.error("Registration failed. There was an error creating your account")
      }
    } catch (error) {
      toast.error("Registration failed. There was an error creating your account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSubmitStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last name</Label>
                  <Input
                    id="surname"
                    name="surname"
                    placeholder="Doe"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login">Username</Label>
                <Input
                  id="login"
                  name="login"
                  placeholder="johndoe"
                  value={formData.login}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitStep2} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to your email. (Use '123456' for demo)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Create Account"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
            </form>
          )}
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
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

