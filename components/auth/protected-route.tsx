"use client"

import type React from "react"

import { useSession } from "@/lib/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated } = useSession()

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Sign In Required</CardTitle>
                <CardDescription>You need to be signed in to access this page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
