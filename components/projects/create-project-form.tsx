"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/lib/session"

export default function CreateProjectForm() {
  const { user } = useSession()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  // const { user } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!supabase) {
      setError("Database connection not configured. Please set up Supabase environment variables.")
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from("projects").insert([
        {
          name: formData.name,
          description: formData.description,
          created_by: user?.id || null,
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ name: "", description: "" })
    } catch (err: any) {
      setError(err.message || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-green-600">Project Created!</CardTitle>
          <CardDescription>Your project has been successfully shared with the community.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/projects">View All Projects</Link>
          </Button>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Create Another Project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Home Button */}
      <div className="flex justify-start">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Create New Project</CardTitle>
          <CardDescription>Share your project with the Bigstone community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., 8-bit CPU Design"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                placeholder="Brief summary of your project"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Project..." : "Create Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
