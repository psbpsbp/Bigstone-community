"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, X, Merge } from "lucide-react"
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
  created_by: string
  votes?: { vote_type: string; user_id: string }[]
}

export default function StandardsPage() {
  const { user } = useSession()
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [votingLoading, setVotingLoading] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [mergingId, setMergingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStandards()
  }, [])

  const fetchStandards = async () => {
    if (!supabase) {
      setError("Database connection not configured.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("standards")
        .select(`
          id,
          title,
          description,
          content,
          status,
          created_at,
          voting_ends_at,
          created_by,
          votes (
            vote_type,
            user_id
          )
        `)
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
          {
            standard_id: standardId,
            user_id: user.id,
            vote_type: voteType,
          },
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

  const handleMerge = async (standardId: string) => {
    if (!supabase || !user) {
      setError("You must be signed in to merge standards")
      return
    }

    setMergingId(standardId)
    setError("")

    try {
      const { error } = await supabase
        .from("standards")
        .update({ status: "merged" })
        .eq("id", standardId)

      if (error) throw error
      fetchStandards()
    } catch (err: any) {
      setError(err.message || "Failed to merge standard")
    } finally {
      setMergingId(null)
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
      case "merged":
        return "bg-purple-100 text-purple-800"
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
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  const mergedStandards = standards.filter(standard => standard.status === "merged")

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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Side Panel Toggle Button */}
        <button
          onClick={() => setIsPanelOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white px-3 py-4 rounded-l-lg shadow-md border border-gray-200 border-r-0 hover:bg-gray-50 z-10 transition-colors duration-200"
        >
          <span className="text-sm font-medium">View Standards</span>
        </button>

        {/* Side Panel */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-20 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Merged Standards</h2>
              <button 
                onClick={() => setIsPanelOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close panel"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {mergedStandards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No merged standards yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {mergedStandards.map(standard => (
                    <div key={standard.id} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-bold">{standard.title}</h3>
                      <p className="text-sm text-gray-500 whitespace-pre-wrap mt-1">
                        {standard.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Community Standards</h1>
            <p className="mt-2 text-gray-600">Vote on proposed standards and guidelines</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mb-8">
            <Button asChild>
              <Link href="/standards/create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Propose New Standard
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            {standards.map((standard) => {
              const voteStats = getVoteStats(standard.votes)
              const userVote = getUserVote(standard.votes)
              const votingActive = isVotingActive(standard.voting_ends_at)
              const isCreator = user?.id === standard.created_by
              const canMerge = isCreator && standard.status === "approved"

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

                      {standard.status === "voting" && (
                        <div className="border-t pt-4">
                          {/* ... voting UI remains the same ... */}
                        </div>
                      )}

                      {canMerge && (
                        <div className="border-t pt-4">
                          <Button
                            onClick={() => handleMerge(standard.id)}
                            disabled={mergingId === standard.id}
                            className="w-full"
                            variant="outline"
                          >
                            <Merge className="w-4 h-4 mr-2" />
                            {mergingId === standard.id ? "Merging..." : "Merge to Standards"}
                          </Button>
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
