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
  const [durationType, setDurationType] = useState("hours") // 'seconds' or 'hours'
  const [durationValue, setDurationValue] = useState("24") // Default to 24 hours
  const [customDuration, setCustomDuration] = useState("")

  const isAdmin = user?.email === "a.e.makarov13@icloud.com" // Adjust this to your admin check

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!supabase) {
      setError("Database connection not configured.")
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
      let durationMs = 0
      
      if (durationValue === "custom") {
        const customValue = parseInt(customDuration)
        if (isNaN(customValue) || customValue <= 0) {
          throw new Error("Invalid duration value")
        }
        durationMs = durationType === "seconds" 
          ? customValue * 1000 
          : customValue * 60 * 60 * 1000
      } else {
        durationMs = durationType === "seconds"
          ? parseInt(durationValue) * 1000
          : parseInt(durationValue) * 60 * 60 * 1000
      }

      const votingEndsAt = new Date(Date.now() + durationMs)

      const { error: insertError } = await supabase.from("standards").insert([
        {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          created_by: user.id,
          created_by_name: user.email,
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
              
              {isAdmin && (
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={durationType === "seconds" ? "default" : "outline"}
                    onClick={() => setDurationType("seconds")}
                    size="sm"
                  >
                    Seconds
                  </Button>
                  <Button
                    type="button"
                    variant={durationType === "hours" ? "default" : "outline"}
                    onClick={() => setDurationType("hours")}
                    size="sm"
                  >
                    Hours
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Select 
                  value={durationValue}
                  onValueChange={(value) => setDurationValue(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationType === "seconds" ? (
                      <>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        {isAdmin && <SelectItem value="custom">Custom</SelectItem>}
                      </>
                    ) : (
                      <>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="72">3 days</SelectItem>
                        <SelectItem value="120">5 days</SelectItem>
                        {isAdmin && <SelectItem value="custom">Custom</SelectItem>}
                      </>
                    )}
                  </SelectContent>
                </Select>

                {durationValue === "custom" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={durationType === "seconds" ? "86400" : "720"} // Max 24h in seconds or 30d in hours
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder={durationType === "seconds" ? "Seconds" : "Hours"}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">
                      {durationType === "seconds" ? "seconds" : "hours"}
                    </span>
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
