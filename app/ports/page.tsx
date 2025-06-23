"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Trash2, Palette } from "lucide-react"
import PortGrid from "@/components/ports/port-grid"
import DatabaseStatus from "@/components/ui/database-status"
import { supabase } from "@/lib/supabase"
import Header from "@/components/layout/header"

interface Port {
  id: string
  name: string
  direction: string
  type: string
  port_count: number
  role: string
  description: string
  grid_data: any[]
  created_at: string
}

export default function PortsPage() {
  const [ports, setPorts] = useState<Port[]>([])
  const [filteredPorts, setFilteredPorts] = useState<Port[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPorts()
  }, [])

  useEffect(() => {
    const filtered = ports.filter(
      (port) =>
        port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        port.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPorts(filtered)
  }, [ports, searchTerm])

  const fetchPorts = async () => {
    if (!supabase) {
      setError("Database connection not configured. Please add Supabase integration to access ports.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("ports").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPorts(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch ports")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePort = async (portId: string, portName: string) => {
    if (!confirm(`Are you sure you want to delete the port "${portName}"? This action cannot be undone.`)) {
      return
    }

    if (!supabase) {
      setError("Database connection not configured")
      return
    }

    setDeletingId(portId)
    setError("")

    try {
      const { error } = await supabase.from("ports").delete().eq("id", portId)

      if (error) throw error

      // Remove from local state
      setPorts((prev) => prev.filter((port) => port.id !== portId))
    } catch (err: any) {
      setError(err.message || "Failed to delete port")
    } finally {
      setDeletingId(null)
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "I":
        return "bg-green-100 text-green-800"
      case "O":
        return "bg-red-100 text-red-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case "I":
        return "Input"
      case "O":
        return "Output"
      case "B":
        return "Bidirectional"
      default:
        return direction
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BIN":
        return "bg-purple-100 text-purple-800"
      case "HEX":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPortColors = (gridData: any[]) => {
    const colors = new Set<string>()
    gridData.forEach((cell) => {
      if (cell.color) {
        colors.add(cell.color)
      }
    })
    return Array.from(colors)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-lg">Loading ports...</div>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Community Ports</h1>
            <p className="mt-2 text-gray-600">Browse and discover ports created by the community</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search ports by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button asChild>
              <Link href="/ports/create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Port
              </Link>
            </Button>
          </div>

          {/* Ports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPorts.map((port) => {
              const portColors = getPortColors(port.grid_data || [])

              return (
                <Card key={port.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{port.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getDirectionColor(port.direction)}>{getDirectionLabel(port.direction)}</Badge>
                        <Badge className={getTypeColor(port.type)}>{port.type}</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {port.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Ports: {port.port_count}</span>
                        <span>Role: {port.role}</span>
                      </div>

                      {/* Show port colors if any */}
                      {portColors.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Colors:</span>
                          <div className="flex gap-1">
                            {portColors.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={`Color: ${color}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <div className="scale-50 origin-center">
                          <PortGrid gridData={port.grid_data || []} onGridChange={() => {}} readonly />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Created {new Date(port.created_at).toLocaleDateString()}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePort(port.id, port.name)}
                          disabled={deletingId === port.id}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deletingId === port.id ? "Deleting..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredPorts.length === 0 && !loading && supabase && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm ? "No ports found matching your search." : "No ports created yet."}
              </div>
              <Button asChild>
                <Link href="/ports/create">Create the First Port</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
