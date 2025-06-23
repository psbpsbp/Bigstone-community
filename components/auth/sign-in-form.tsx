"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/lib/auth"

export default function SignInForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signIn(formData.username, formData.password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (success && countdown === 0) {
      // Always go to dashboard after sign in
      router.push("/dashboard")
    }
  }, [success, countdown, router])

  if (success) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl text-green-600">Welcome Back!</CardTitle>
          <CardDescription>Redirecting you back in {countdown} seconds...</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Welcome back to the Bigstone community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center space-y-2">
            <Link href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
