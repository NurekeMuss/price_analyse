"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

interface TwoFactorVerificationProps {
  onVerify: (code: string) => void
  onCancel?: () => void
  loading?: boolean
  title?: string
  description?: string
  showCancel?: boolean
}

export function TwoFactorVerification({
  onVerify,
  onCancel,
  loading = false,
  title = "Two-Factor Authentication",
  description = "Enter the verification code from your authenticator app",
  showCancel = true,
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState("")
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef<HTMLInputElement>())
  const [codeValues, setCodeValues] = useState(Array(6).fill(""))

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value)
  }

  const handleDigitChange = (index: number, value: string) => {
    // Update the digit at the specific index
    const newCodeValues = [...codeValues]
    newCodeValues[index] = value
    setCodeValues(newCodeValues)

    // Combine all digits to update the full code
    setCode(newCodeValues.join(""))

    // Move focus to the next input if value exists
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !codeValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // If pasted data is a 6-digit code, distribute it across the inputs
    if (/^\d{6}$/.test(pastedData)) {
      const newCodeValues = pastedData.split("")
      setCodeValues(newCodeValues)
      setCode(pastedData)

      // Focus the last input
      inputRefs[5].current?.focus()
    }
  }

  const handleVerify = () => {
    if (code.length === 6) {
      onVerify(code)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {inputRefs.map((ref, index) => (
              <Input
                key={index}
                ref={ref}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="h-12 w-12 text-center text-lg font-bold"
                value={codeValues[index]}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
              />
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Open your two-factor authentication app to view your authentication code
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={handleVerify} className="w-full" disabled={code.length !== 6 || loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
        {showCancel && onCancel && (
          <Button variant="ghost" onClick={onCancel} className="w-full" disabled={loading}>
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
