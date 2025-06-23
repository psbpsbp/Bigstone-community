"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, FileDown, Pencil, Trash2 } from "lucide-react"

// Replacing alias imports with relative paths to ensure compatibility in all environments
import DatabaseStatus from "../components/ui/database-status"
import { supabase } from "../lib/supabase"
import { useSession } from "../lib/session"
import Header from "../components/layout/header"

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

interface SubVote {
  id: string
  standard_id: string
  type: "add" | "edit" | "remove"
  content: string
  user_id: string
  created_at: string
  votes?: { vote_type: string; user_id: string }[]
}

export default function StandardsPage() {
  const { user } = useSession()
  const [standards, setStandards] = useState<Standard[]>([])
  const [subVotes, setSubVotes] = useState<SubVote[]>([])
  const [selectedStandards, setSelectedStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [votingLoading, setVotingLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchStandards()
    fetchSubVotes()
  }, [])

  const fetchStandards = async () => {
    const { data, error } = await supabase.from("standards").select("*, votes(vote_type, user_id)").order("created_at", { ascending: false })
    if (error) setError(error.message)
    else setStandards(data || [])
    setLoading(false)
  }

  const fetchSubVotes = async () => {
    const { data, error } = await supabase.from("sub_votes").select("*, votes(vote_type, user_id)").order("created_at", { ascending: false })
    if (error) setError(error.message)
    else setSubVotes(data || [])
  }

  const handleSubVote = async (standardId: string, type: "add" | "edit" | "remove", content: string) => {
    if (!user) return
    await supabase.from("sub_votes").insert({ standard_id: standardId, type, content, user_id: user.id })
    fetchSubVotes()
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
${selectedStandards.map(s => {
  const subs = subVotes.filter(sv => sv.standard_id === s.id)
  const changes = subs.map(sv => `<div><strong>${sv.type.toUpperCase()}:</strong> ${sv.content}</div>`).join("<hr/>")
  return `<div class="standard"><h2>${s.title}</h2><p>${s.description}</p><pre>${s.content}</pre>${changes}</div>`
}).join("\n")}
</body></html>`
    const blob = new Blob([htmlContent], { type: "text/html" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "standards.html"
    a.click()
  }

  if (loading) return <div className="text-center py-12">Loading standards...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <>
      <Header />
      <div className="flex">
        <div className="flex-1 px-6 py-12 space-y-6">
          <h1 className="text-3xl font-bold">Community Standards</h1>
          {standards.map((standard) => (
            <Card key={standard.id}>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>{standard.title}</CardTitle>
                  <CardDescription>{standard.description}</CardDescription>
                </div>
                <Badge>{standard.status}</Badge>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-800 mb-4">{standard.content}</p>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => handleSubVote(standard.id, "add", prompt("Add content:") || "")}> <Plus className="w-3 h-3 mr-1" /> Add</Button>
                  <Button size="sm" onClick={() => handleSubVote(standard.id, "edit", prompt("Edit content:") || "")}> <Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleSubVote(standard.id, "remove", prompt("Remove what?") || "")}> <Trash2 className="w-3 h-3 mr-1" /> Remove</Button>
                  <Button size="sm" onClick={() => handleAddToDoc(standard)}>📎 Add to Doc</Button>
                </div>
                <div className="mt-4 space-y-2">
                  {subVotes.filter(sv => sv.standard_id === standard.id).map(sv => (
                    <div key={sv.id} className="border rounded p-2 text-sm">
                      <strong>{sv.type.toUpperCase()}</strong>: {sv.content}
                      <div className="text-xs text-gray-500">Suggested by {sv.user_id}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="w-96 border-l p-6 bg-white overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Standards Doc</h2>
          {selectedStandards.length === 0 ? (
            <p className="text-sm text-gray-500">No standards added yet.</p>
          ) : (
            selectedStandards.map((s) => (
              <div key={s.id} className="mb-6 border p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm mb-2 text-gray-700">{s.description}</p>
                <div className="text-sm whitespace-pre-wrap text-gray-800 border p-2 rounded bg-white">{s.content}</div>
                <div className="mt-3 space-y-1 text-sm">
                  {subVotes.filter(sv => sv.standard_id === s.id).map(sv => (
                    <div key={sv.id} className="border p-2 rounded">
                      <strong>{sv.type.toUpperCase()}</strong>: {sv.content}
                      <div className="text-xs text-gray-500">By {sv.user_id}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <Button className="w-full mt-4" onClick={handleDownloadHtml} disabled={selectedStandards.length === 0}>
            <FileDown className="w-4 h-4 mr-2" /> Download HTML
          </Button>
        </div>
      </div>
    </>
  )
}
