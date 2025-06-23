"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, FileDown } from "lucide-react"
import DatabaseStatus from "@/components/ui/database-status"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/lib/session"
import Header from "@/components/layout/header"

interface Standard {
  id: string
  title: string
  description: string
  content: string
  status: string
  created_at: string
  voting_ends_at: string
  votes?: { vote_type: string; user_id: string }[]
}

export default function StandardsPage() {
  const { user } = useSession()
  const [standards, setStandards] = useState<Standard[]>([])
  const [selectedStandards, setSelectedStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [votingLoading, setVotingLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchStandards()
  }, [])

  const fetchStandards = async () => {
    if (!supabase) {
      setError("Database connection not configured. Please add Supabase integration to access standards.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("standards")
        .select(`*, votes(vote_type, user_id)`)
        .order("created_at", { ascending: false })

      if (error) throw error
      setStandards(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch standards")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (standardId: string, voteType: "approve" | "deny") => {
    if (!supabase || !user) {
      setError("You must be signed in to vote")
      return
    }

    setVotingLoading(standardId)
    setError("")

    try {
      const { data: existingVote } = await supabase
        .from("votes")
        .select("*")
        .eq("standard_id", standardId)
        .eq("user_id", user.id)
        .single()

      if (existingVote) {
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("standard_id", standardId)
          .eq("user_id", user.id)
      } else {
        const { error } = await supabase.from("votes").insert([
          { standard_id: standardId, user_id: user.id, vote_type: voteType },
        ])
        if (error) throw error
      }

      fetchStandards()
    } catch (err: any) {
      setError(err.message || "Failed to submit vote")
    } finally {
      setVotingLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "voting": return "bg-blue-100 text-blue-800"
      case "approved": return "bg-green-100 text-green-800"
      case "denied": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getVoteStats = (votes: { vote_type: string; user_id: string }[] = []) => {
    const approveCount = votes.filter(v => v.vote_type === "approve").length
    const denyCount = votes.filter(v => v.vote_type === "deny").length
    const total = approveCount + denyCount
    const approvePercentage = total > 0 ? (approveCount / total) * 100 : 0
    return { approveCount, denyCount, total, approvePercentage }
  }

  const getUserVote = (votes: { vote_type: string; user_id: string }[] = []) => {
    if (!user) return null
    return votes.find(v => v.user_id === user.id)?.vote_type || null
  }

  const isVotingActive = (votingEndsAt: string) => new Date(votingEndsAt) > new Date()

  const getTimeRemaining = (votingEndsAt: string) => {
    const now = new Date()
    const end = new Date(votingEndsAt)
    const diff = end.getTime() - now.getTime()
    if (diff <= 0) return "Voting ended"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`
  }

  const handleAddToDoc = (standard: Standard) => {
    if (!selectedStandards.find(s => s.id === standard.id)) {
      setSelectedStandards([...selectedStandards, standard])
    }
  }

  const handleDownloadHtml = () => {
    const htmlContent = `
<html><head><style>
body { font-family: sans-serif; padding: 2em; }
.standard { margin-bottom: 2em; border: 1px solid #ccc; padding: 1em; border-radius: 8px; }
h2 { color: #333; }
</style></head><body>
${selectedStandards.map(s => `
  <div class="standard">
    <h2>${s.title}</h2>
    <p>${s.description}</p>
    <pre>${s.content}</pre>
  </div>
`).join("\n")}
</body></html>`

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "standards.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-12">Loading standards...</div>
  if (error && !supabase) return <DatabaseStatus error={error} />

  return (
    <>
      <Header />
      <div className="flex">
        {/* Left: Standards List */}
        <div className="flex-1 px-6 py-12 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Community Standards</h1>
            <p className="text-gray-600">Vote on proposed standards and add approved ones to your doc.</p>
          </div>

          <div className="flex justify-center mb-8">
            <Button asChild>
              <Link href="/standards/create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Propose New Standard
              </Link>
            </Button>
          </div>

          {standards.map((standard) => {
            const voteStats = getVoteStats(standard.votes)
            const userVote = getUserVote(standard.votes)
            const votingActive = isVotingActive(standard.voting_ends_at)

            return (
              <Card key={standard.id}>
                <CardHeader className="flex justify-between items-start">
                  <div>
                    <CardTitle>{standard.title}</CardTitle>
                    <CardDescription>{standard.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(standard.status)}>
                    {standard.status.charAt(0).toUpperCase() + standard.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-gray-800">{standard.content}</p>

                  {standard.status === "voting" && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{getTimeRemaining(standard.voting_ends_at)}</span>
                        <span>{voteStats.total} vote{voteStats.total !== 1 ? "s" : ""}</span>
                      </div>
                      {voteStats.total > 0 && (
                        <div>
                          <Progress value={voteStats.approvePercentage} className="h-2 mt-2" />
                          <div className="text-xs mt-1">Approve: {voteStats.approveCount}, Deny: {voteStats.denyCount}</div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleVote(standard.id, "approve")} disabled={votingLoading === standard.id} className="flex-1 bg-green-600 hover:bg-green-700">
                          <ThumbsUp className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button onClick={() => handleVote(standard.id, "deny")} disabled={votingLoading === standard.id} variant="destructive" className="flex-1">
                          <ThumbsDown className="w-4 h-4 mr-2" /> Deny
                        </Button>
                      </div>
                    </div>
                  )}

                  {standard.status === "approved" && (
                    <div className="pt-2 border-t">
                      <Button variant="outline" onClick={() => handleAddToDoc(standard)}>
                        <Plus className="w-4 h-4 mr-2" /> Add to Standards Doc
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">Proposed {new Date(standard.created_at).toLocaleDateString()}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Right: Side Panel */}
        <div className="w-80 border-l p-6 bg-white">
          <h2 className="text-lg font-bold mb-4">Standards Doc</h2>
          {selectedStandards.length === 0 ? (
            <p className="text-sm text-gray-500">No standards added yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {selectedStandards.map((s) => (
                <li key={s.id} className="text-blue-700 underline">{s.title}</li>
              ))}
            </ul>
          )}
          <Button className="mt-6 w-full" onClick={handleDownloadHtml} disabled={selectedStandards.length === 0}>
            <FileDown className="w-4 h-4 mr-2" /> Download HTML
          </Button>
        </div>
      </div>
    </>
  )
}
