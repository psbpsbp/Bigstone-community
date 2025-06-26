"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/layout/header"

interface Standard {
  id: string
  title: string
  description: string
  content: string
  created_at: string
}

export default function WikiPage() {
  const [standards, setStandards] = useState<Standard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const { data, error } = await supabase
          .from("standards")
          .select("id, title, description, content, created_at")
          .eq("status", "merged")
          .order("created_at", { ascending: false })

        if (error) throw error
        setStandards(data || [])
        console.log("Wiki standards loaded:", data) // Debug log
      } catch (err) {
        console.error("Wiki fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStandards()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          Loading wiki standards...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Standards Wiki</h1>
        
        {standards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No standards have been merged yet. Check back later.
          </div>
        ) : (
          <div className="space-y-8">
            {standards.map(standard => (
              <div key={standard.id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2">{standard.title}</h2>
                <p className="text-gray-600 mb-4">{standard.description}</p>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{standard.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  Merged on {new Date(standard.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
