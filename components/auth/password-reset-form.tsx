"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyUserForReset, resetPassword } from "@/lib/auth"
import Link from "next/link"

export default function PasswordResetForm() {
  const [step, setStep] = useState<"verify" | "reset" | "success">("verify")
  const [verifyData, setVerifyData] = useState({
    username: "",
    email: "",
  })
  const [resetData, setResetData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await verifyUserForReset(verifyData.username, verifyData.email)
      setUserId(user.id)
      setStep("reset")
    } catch (err: any) {
      setError(err.message || "Username and email do not match")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (resetData.newPassword !== resetData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (resetData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      await resetPassword(userId, resetData.newPassword)
      setStep("success")
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl text-green-600">Password Reset!</CardTitle>
          <CardDescription>Your password has been successfully updated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign In Now</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "reset") {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>Enter your new password for {verifyData.username}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={resetData.newPassword}
                onChange={(e) => setResetData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating Password..." : "Update Password"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => setStep("verify")}>
              Back to Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Reset Password</CardTitle>
        <CardDescription>Enter your username and email to verify your identity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Discord Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Your Discord username"
              value={verifyData.username}
              onChange={(e) => setVerifyData((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={verifyData.email}
              onChange={(e) => setVerifyData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify Identity"}
          </Button>

          <div className="text-center">
            <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
