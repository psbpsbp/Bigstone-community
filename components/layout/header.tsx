"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/session"
import { User, LogOut, Home } from "lucide-react"

export default function Header() {
  const { user, isAuthenticated, signOut } = useSession()

  if (!isAuthenticated) {
    return null // Don't show header if not signed in
  }

  const handleSignOut = () => {
    signOut()
    window.location.href = "/" // Redirect to home after sign out
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home - Just the title, no back button */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Home className="w-6 h-6" />
              Bigstone Community
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/ports" className="text-gray-600 hover:text-gray-900">
              Ports
            </Link>
            <Link href="/standards" className="text-gray-600 hover:text-gray-900">
              Standards
            </Link>
            <Link href="/projects" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
            <Link href="/examples" className="text-gray-600 hover:text-gray-900">
              Example
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              {user?.username}
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
