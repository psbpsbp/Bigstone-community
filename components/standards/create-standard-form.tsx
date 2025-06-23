"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/lib/session"

export default function CreateStandardForm() {
  const { user } = useSession()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Check if Supabase is configured
    if (!supabase) {
      setError("Database connection not configured. Please set up Supabase environment variables.")
      setLoading(false)
      return
    }

    if (!user) {
      setError("You must be signed in to create a standard")
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from("standards").insert([
        {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          created_by: user.id, // Now using actual user ID
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ title: "", description: "", content: "" })
    } catch (err: any) {
      setError(err.message || "Failed to create standard")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle className="text-xl text-green-600">Standard Submitted!</CardTitle>
              <CardDescription>
                Your standard has been submitted for community voting. Voting will be open for 24 hours.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/standards">View All Standards</Link>
          </Button>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Submit Another Standard
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
          <CardTitle className="text-xl">Propose New Standard</CardTitle>
          <CardDescription>
            Submit a new standard for community voting. All users will have 24 hours to vote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Standard Title</Label>
              <Input
                id="title"
                placeholder="e.g., New Port Naming Convention"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                placeholder="Brief summary of the standard"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Detailed Content</Label>
              <Textarea
                id="content"
                placeholder="Provide detailed explanation of the standard, including examples and rationale..."
                className="min-h-[200px]"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Standard for Voting"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
