"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle } from "lucide-react"
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
        .select(
          *,
          votes(vote_type, user_id)
        )
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
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select("*")
        .eq("standard_id", standardId)
        .eq("user_id", user.id)
        .single()

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("standard_id", standardId)
          .eq("user_id", user.id)
      } else {
        // Insert new vote
        const { error } = await supabase.from("votes").insert([
          {
            standard_id: standardId,
            user_id: user.id,
            vote_type: voteType,
          },
        ])

        if (error) throw error
      }

      // Refresh standards to show updated vote counts
      fetchStandards()
    } catch (err: any) {
      setError(err.message || "Failed to submit vote")
    } finally {
      setVotingLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "voting":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "denied":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVoteStats = (votes: { vote_type: string; user_id: string }[] = []) => {
    const approveCount = votes.filter((v) => v.vote_type === "approve").length
    const denyCount = votes.filter((v) => v.vote_type === "deny").length
    const total = approveCount + denyCount
    const approvePercentage = total > 0 ? (approveCount / total) * 100 : 0

    return { approveCount, denyCount, total, approvePercentage }
  }

  const getUserVote = (votes: { vote_type: string; user_id: string }[] = []) => {
    if (!user) return null
    const userVote = votes.find((v) => v.user_id === user.id)
    return userVote?.vote_type || null
  }

  const isVotingActive = (votingEndsAt: string) => {
    return new Date(votingEndsAt) > new Date()
  }

  const getTimeRemaining = (votingEndsAt: string) => {
    const now = new Date()
    const end = new Date(votingEndsAt)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Voting ended"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return ${hours}h ${minutes}m remaining
    }
    return ${minutes}m remaining
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-lg">Loading standards...</div>
        </div>
      </div>
    )
  }

  if (error && !supabase) {
    return <DatabaseStatus error={error} />
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Community Standards</h1>
            <p className="mt-2 text-gray-600">Vote on proposed standards and guidelines</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Create Button */}
          <div className="flex justify-center mb-8">
            <Button asChild>
              <Link href="/standards/create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Propose New Standard
              </Link>
            </Button>
          </div>

          {/* Standards List */}
          <div className="space-y-6">
            {standards.map((standard) => {
              const voteStats = getVoteStats(standard.votes)
              const userVote = getUserVote(standard.votes)
              const votingActive = isVotingActive(standard.voting_ends_at)

              return (
                <Card key={standard.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{standard.title}</CardTitle>
                        <CardDescription className="mt-2">{standard.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(standard.status)}>
                        {standard.status.charAt(0).toUpperCase() + standard.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{standard.content}</p>
                      </div>

                      {/* Voting Section */}
                      {standard.status === "voting" && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {getTimeRemaining(standard.voting_ends_at)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {voteStats.total} vote{voteStats.total !== 1 ? "s" : ""}
                            </div>
                          </div>

                          {voteStats.total > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-green-600">Approve: {voteStats.approveCount}</span>
                                <span className="text-red-600">Deny: {voteStats.denyCount}</span>
                              </div>
                              <Progress value={voteStats.approvePercentage} className="h-2" />
                            </div>
                          )}

                          {/* Show user's current vote */}
                          {userVote && (
                            <div className="mb-3 text-sm text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {userVote === "approve" ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    You voted to approve
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" />
                                    You voted to deny
                                  </>
                                )}
                              </span>
                            </div>
                          )}

                          {votingActive && user && (
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleVote(standard.id, "approve")}
                                disabled={votingLoading === standard.id}
                                className={flex-1 ${userVote === "approve" ? "bg-green-700" : "bg-green-600 hover:bg-green-700"}}
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                {userVote === "approve" ? "Approved" : "Approve"}
                              </Button>
                              <Button
                                onClick={() => handleVote(standard.id, "deny")}
                                disabled={votingLoading === standard.id}
                                variant={userVote === "deny" ? "default" : "destructive"}
                                className="flex-1"
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                {userVote === "deny" ? "Denied" : "Deny"}
                              </Button>
                            </div>
                          )}

                          {votingActive && !user && (
                            <div className="text-center py-4">
                              <p className="text-gray-600 mb-3">Sign in to vote on this standard</p>
                              <Button asChild>
                                <Link href="/auth/signin">Sign In to Vote</Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 border-t pt-2">
                        Proposed {new Date(standard.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {standards.length === 0 && !loading && supabase && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No standards proposed yet.</div>
              <Button asChild>
                <Link href="/standards/create">Propose the First Standard</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
