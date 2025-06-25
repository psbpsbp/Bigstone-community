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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [votingDuration, setVotingDuration] = useState("24") // Default to 24 hours
  const [customDuration, setCustomDuration] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

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
      // Calculate voting end time
      const durationHours = votingDuration === "custom" 
        ? parseInt(customDuration) 
        : parseInt(votingDuration)
      
      if (isNaN(durationHours) || durationHours <= 0) {
        throw new Error("Invalid voting duration")
      }

      const votingEndsAt = new Date()
      votingEndsAt.setHours(votingEndsAt.getHours() + durationHours)

      const { error: insertError } = await supabase.from("standards").insert([
        {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          created_by: user.id,
          created_by_name: user.email, // or user.name if available
          voting_ends_at: votingEndsAt.toISOString(),
          status: "voting",
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
                Your standard has been submitted for community voting.
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
            Submit a new standard for community voting.
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
                placeholder="Provide detailed explanation of the standard..."
                className="min-h-[200px]"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                required
              />
            </div>

            {/* Voting Duration Selector */}
            <div className="space-y-2">
              <Label>Voting Duration</Label>
              <div className="flex gap-2">
                <Select 
                  value={votingDuration}
                  onValueChange={(value) => setVotingDuration(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="120">5 days</SelectItem>
                    {user?.email === "aFormalParrot@example.com" && (
                      <SelectItem value="custom">Custom</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {votingDuration === "custom" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="720" // 30 days
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="Hours"
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">hours</span>
                  </div>
                )}
              </div>
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