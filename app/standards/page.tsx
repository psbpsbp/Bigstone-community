"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, X, Merge, Edit, Download } from "lucide-react"
import DatabaseStatus from "@/components/ui/database-status"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/lib/session"
import Header from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { jsPDF } from "jspdf"

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
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null)
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null)
  const [panelWidth, setPanelWidth] = useState(80)
  const panelRef = useRef<HTMLDivElement>(null)

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

  // ... [keep all other existing functions: handleVote, handleMerge, etc.]

  const handleStandardClick = (id: string) => {
    if (expandedStandard === id) {
      setExpandedStandard(null)
      setPanelWidth(80)
    } else {
      setExpandedStandard(id)
      setPanelWidth(120) // Wider panel when expanded
    }
  }

  const downloadAsPDF = () => {
    const doc = new jsPDF()
    let yPosition = 20
    
    doc.setFontSize(18)
    doc.text("Merged Standards", 105, 15, { align: 'center' })
    doc.setFontSize(12)
    
    mergedStandards.forEach((standard, index) => {
      doc.setFontSize(14)
      doc.text(standard.title, 15, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      const splitDesc = doc.splitTextToSize(standard.description, 180)
      doc.text(splitDesc, 15, yPosition)
      yPosition += splitDesc.length * 7 + 10
      
      const splitContent = doc.splitTextToSize(standard.content, 180)
      doc.text(splitContent, 15, yPosition)
      yPosition += splitContent.length * 7 + 15
      
      if (index < mergedStandards.length - 1) {
        doc.line(15, yPosition, 195, yPosition)
        yPosition += 10
      }
      
      if (yPosition > 280) {
        doc.addPage()
        yPosition = 20
      }
    })
    
    doc.save("merged_standards.pdf")
  }

  const mergedStandards = standards.filter(standard => standard.status === "merged")

  // ... [keep all the loading/error state handling]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Side Panel Toggle Button - moved left to avoid overlap */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`fixed ${isPanelOpen ? 'right-80' : 'right-0'} top-1/2 transform -translate-y-1/2 bg-white px-3 py-4 rounded-l-lg shadow-md border border-gray-200 border-r-0 hover:bg-gray-50 z-10 transition-all duration-300`}
        >
          <span className="text-sm font-medium">
            {isPanelOpen ? "Hide" : "View Standards"}
          </span>
        </button>

        {/* Side Panel */}
        <div 
          ref={panelRef}
          className={`fixed top-0 right-0 h-full bg-white shadow-lg border-l border-gray-200 transform transition-all duration-300 ease-in-out z-20 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: `${panelWidth}vw`, maxWidth: '600px' }}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Merged Standards</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadAsPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {mergedStandards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No merged standards yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {mergedStandards.map(standard => {
                    const isExpanded = expandedStandard === standard.id
                    const isCreator = user?.id === standard.created_by
                    
                    return (
                      <div 
                        key={standard.id} 
                        className={`border rounded-lg p-3 transition-all ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <div 
                          className="flex justify-between items-center"
                          onClick={() => handleStandardClick(standard.id)}
                        >
                          <h3 className="font-bold">{standard.title}</h3>
                          {isCreator && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditRequest(standard)
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              aria-label="Edit standard"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {standard.description}
                            </p>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {standard.content}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 pt-2">
                              Created: {new Date(standard.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingStandard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Edit Standard</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingStandard.title}
                      onChange={(e) => setEditingStandard({...editingStandard, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={editingStandard.description}
                      onChange={(e) => setEditingStandard({...editingStandard, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={editingStandard.content}
                      onChange={(e) => setEditingStandard({...editingStandard, content: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingStandard(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit for Voting (1 hour)
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* ... [rest of your main content remains the same] */}
        </div>
      </div>
    </>
  )
}
