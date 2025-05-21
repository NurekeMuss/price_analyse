"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, KeyRound, ShieldCheck, AlertTriangle, Smartphone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { TwoFactorVerification } from "@/components/two-factor-verification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SecurityPage() {
  const router = useRouter()
  const { user, loading: authLoading, enableTwoFactor, verifyTwoFactorSetup, disableTwoFactor } = useAuth()
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [setupPassword, setSetupPassword] = useState("")
  const [disablePassword, setDisablePassword] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const auth = useAuth() // Moved useAuth hook to the top level

  const handleEnableTwoFactor = async () => {
    if (!setupPassword) {
      toast.error("Please enter your password to continue")
      return
    }

    setLoading(true)
    try {
      const result = await enableTwoFactor(setupPassword)
      setQrCode(result.qr_code)
      setSecret(result.secret)
      toast.success("Scan the QR code with your authenticator app")
      setSetupDialogOpen(false)
      setVerifyDialogOpen(true)
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      toast.error("Failed to enable two-factor authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTwoFactor = async (code: string) => {
    setLoading(true)
    try {
      const result = await verifyTwoFactorSetup(code)
      if (result.is_verified) {
        setIsTwoFactorEnabled(true)
        toast.success("Two-factor authentication has been enabled")
        setVerifyDialogOpen(false)
      } else {
        toast.error("Invalid verification code")
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error)
      toast.error("Failed to verify two-factor authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    if (!disablePassword || !disableCode) {
      toast.error("Please enter both your password and verification code")
      return
    }

    setLoading(true)
    try {
      await disableTwoFactor(disablePassword, disableCode)
      setIsTwoFactorEnabled(false)
      toast.success("Two-factor authentication has been disabled")
      setDisableDialogOpen(false)
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      toast.error("Failed to disable two-factor authentication")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      setIsTwoFactorEnabled(user.is_2fa_enabled || false)
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">Manage your account security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-12 w-12 text-primary" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-muted-foreground">Security level: {isTwoFactorEnabled ? "Enhanced" : "Basic"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Password:</span>
                  <span className="text-sm ml-auto">••••••••</span>
                </div>
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Two-Factor:</span>
                  <span className={`text-sm ml-auto ${isTwoFactorEnabled ? "text-green-600" : "text-red-600"}`}>
                    {isTwoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password for better security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      {isTwoFactorEnabled
                        ? "Your account is protected with two-factor authentication"
                        : "Protect your account with two-factor authentication"}
                    </p>
                  </div>
                  <Switch checked={isTwoFactorEnabled} disabled />
                </div>

                {isTwoFactorEnabled ? (
                  <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Disable Two-Factor Authentication</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove an important security layer from your account. Are you sure you want to
                          continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="disable-password">Your Password</Label>
                          <Input
                            id="disable-password"
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="disable-code">Verification Code</Label>
                          <Input
                            id="disable-code"
                            value={disableCode}
                            onChange={(e) => setDisableCode(e.target.value)}
                            placeholder="Enter code from authenticator app"
                          />
                        </div>
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault()
                            handleDisableTwoFactor()
                          }}
                          className="bg-destructive text-destructive-foreground"
                          disabled={loading}
                        >
                          {loading ? "Disabling..." : "Disable"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Enable Two-Factor Authentication</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          Add an extra layer of security to your account by requiring a verification code when you sign
                          in.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="setup-password">Confirm Your Password</Label>
                          <Input
                            id="setup-password"
                            type="password"
                            value={setupPassword}
                            onChange={(e) => setSetupPassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                        </div>

                        <div className="bg-muted p-4 rounded-md">
                          <h4 className="font-medium flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> Important
                          </h4>
                          <ul className="text-sm space-y-1 mt-2 list-disc pl-5">
                            <li>You'll need to download an authenticator app like Google Authenticator or Authy</li>
                            <li>
                              After setup, you'll need to enter a verification code each time you sign in to your
                              account
                            </li>
                            <li>Make sure to save your recovery codes in a safe place</li>
                          </ul>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSetupDialogOpen(false)} disabled={loading}>
                          Cancel
                        </Button>
                        <Button onClick={handleEnableTwoFactor} disabled={loading}>
                          {loading ? "Processing..." : "Continue"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {qrCode && (
                  <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                          Scan this QR code with your authenticator app and enter the verification code to complete
                          setup
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="border rounded-lg p-2 bg-white">
                          <img src={qrCode || "/placeholder.svg"} alt="QR Code for 2FA setup" className="h-48 w-48" />
                        </div>

                        {secret && (
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">
                              If you can't scan the QR code, enter this code manually:
                            </p>
                            <p className="font-mono bg-muted p-2 rounded text-center select-all">{secret}</p>
                          </div>
                        )}

                        <TwoFactorVerification
                          onVerify={handleVerifyTwoFactor}
                          loading={loading}
                          title="Verify Setup"
                          description="Enter the code from your authenticator app"
                          showCancel={false}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Separator />

                <div className="rounded-md border p-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Recovery Options</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isTwoFactorEnabled
                          ? "If you lose access to your authenticator app, you'll need recovery codes to access your account."
                          : "After enabling two-factor authentication, you'll receive recovery codes to use if you lose access to your authenticator app."}
                      </p>
                      {isTwoFactorEnabled && (
                        <Button variant="outline" size="sm" className="mt-2">
                          View Recovery Codes
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
