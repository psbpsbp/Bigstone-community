"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, FileText, Users, Zap, FolderOpen, Grid3X3 } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is signed in, redirect to dashboard
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // If user is authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Bigstone Community</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A collaborative platform for sharing ports, standards, projects, and examples following BIGSTONE standards
          </p>
        </div>

        {/* Auth Section - Prominent */}
        <div className="text-center mb-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join the Community</CardTitle>
              <CardDescription>Sign up to access ports, standards, projects, and the example</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview - No Action Buttons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Cpu className="w-6 h-6 text-blue-600" />
                Ports
              </CardTitle>
              <CardDescription className="text-sm">Digital circuit ports following BIGSTONE standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-600">
                <p>• 16x16 grid layout system</p>
                <p>• Standardized naming</p>
                <p>• Input/Output definitions</p>
              </div>
              <div className="text-xs text-gray-500 italic">Sign in to access</div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="w-6 h-6 text-green-600" />
                Standards
              </CardTitle>
              <CardDescription className="text-sm">Community guidelines and voting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-600">
                <p>• 24-hour voting period</p>
                <p>• Democratic decisions</p>
                <p>• Transparent process</p>
              </div>
              <div className="text-xs text-gray-500 italic">Sign in to access</div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <FolderOpen className="w-6 h-6 text-purple-600" />
                Projects
              </CardTitle>
              <CardDescription className="text-sm">Community projects and builds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-600">
                <p>• Share your builds</p>
                <p>• Use community ports</p>
                <p>• Collaborate with others</p>
              </div>
              <div className="text-xs text-gray-500 italic">Sign in to access</div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Grid3X3 className="w-6 h-6 text-orange-600" />
                Example
              </CardTitle>
              <CardDescription className="text-sm">All ports combined in one grid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-600">
                <p>• All ports from ports tab</p>
                <p>• Combined 16x16 view</p>
                <p>• Auto-generated</p>
              </div>
              <div className="text-xs text-gray-500 italic">Sign in to access</div>
            </CardContent>
          </Card>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">Community</div>
              <div className="text-slate-600">Driven</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">Fast</div>
              <div className="text-slate-600">Collaboration</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">BIGSTONE</div>
              <div className="text-slate-600">Standards</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
