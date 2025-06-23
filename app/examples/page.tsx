"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Grid3X3, Cpu, Palette } from "lucide-react"
import PortGrid from "@/components/ports/port-grid"
import { supabase } from "@/lib/supabase"
import Header from "@/components/layout/header"

interface Port {
  id: string
  name: string
  direction: string
  type: string
  grid_data: any[]
}

interface CombinedGridCell {
  x: number
  y: number
  type: "input" | "output" | null
  ports: string[]
  color?: string
}

export default function ExamplePage() {
  const [ports, setPorts] = useState<Port[]>([])
  const [combinedGrid, setCombinedGrid] = useState<CombinedGridCell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalPorts: 0,
    inputPorts: 0,
    outputPorts: 0,
    bidirectionalPorts: 0,
    occupiedCells: 0,
  })

  useEffect(() => {
    fetchAllPorts()
  }, [])

  const fetchAllPorts = async () => {
    if (!supabase) {
      setError("Database connection not configured")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("ports").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPorts(data || [])
      generateCombinedGrid(data || [])
      calculateStats(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch ports")
    } finally {
      setLoading(false)
    }
  }

  const generateCombinedGrid = (allPorts: Port[]) => {
    const gridMap = new Map<string, CombinedGridCell>()

    allPorts.forEach((port) => {
      if (port.grid_data && Array.isArray(port.grid_data)) {
        port.grid_data.forEach((cell: any) => {
          if (cell.x && cell.y) {
            const key = `${cell.x}-${cell.y}`
            const existing = gridMap.get(key)

            if (existing) {
              existing.ports.push(port.name)
              // If this cell has a color and the existing doesn't, use this color
              if (cell.color && !existing.color) {
                existing.color = cell.color
              }
            } else {
              gridMap.set(key, {
                x: cell.x,
                y: cell.y,
                type: cell.type,
                ports: [port.name],
                color: cell.color,
              })
            }
          }
        })
      }
    })

    setCombinedGrid(Array.from(gridMap.values()))
  }

  const calculateStats = (allPorts: Port[]) => {
    const inputPorts = allPorts.filter((p) => p.direction === "I").length
    const outputPorts = allPorts.filter((p) => p.direction === "O").length
    const bidirectionalPorts = allPorts.filter((p) => p.direction === "B").length

    const occupiedCells = new Set()
    allPorts.forEach((port) => {
      if (port.grid_data && Array.isArray(port.grid_data)) {
        port.grid_data.forEach((cell: any) => {
          if (cell.x && cell.y) {
            occupiedCells.add(`${cell.x}-${cell.y}`)
          }
        })
      }
    })

    setStats({
      totalPorts: allPorts.length,
      inputPorts,
      outputPorts,
      bidirectionalPorts,
      occupiedCells: occupiedCells.size,
    })
  }

  const gridForDisplay = combinedGrid.map((cell) => ({
    x: cell.x,
    y: cell.y,
    type: cell.type,
    color: cell.color,
  }))

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-lg">Loading example...</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Example</h1>
            <p className="mt-2 text-gray-600">All ports from the ports tab combined in one grid</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPorts}</div>
                <div className="text-sm text-gray-600">Total Ports</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats.inputPorts}</div>
                <div className="text-sm text-gray-600">Input Ports</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{stats.outputPorts}</div>
                <div className="text-sm text-gray-600">Output Ports</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">{stats.bidirectionalPorts}</div>
                <div className="text-sm text-gray-600">Bidirectional</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-600">{stats.occupiedCells}</div>
                <div className="text-sm text-gray-600">Grid Cells Used</div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Grid */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Grid3X3 className="w-6 h-6 text-orange-600" />
                All Ports Combined
              </CardTitle>
              <CardDescription>
                All {stats.totalPorts} ports from the ports tab displayed on one 16x16 grid with colors
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="scale-75 md:scale-100">
                <PortGrid gridData={gridForDisplay} onGridChange={() => {}} readonly />
              </div>
            </CardContent>
          </Card>

          {/* Port Details */}
          {combinedGrid.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grid Details</CardTitle>
                <CardDescription>Which ports are at each position with their colors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {combinedGrid
                    .sort((a, b) => a.x - b.x || a.y - b.y)
                    .map((cell) => (
                      <div key={`${cell.x}-${cell.y}`} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            ({cell.x}, {cell.y})
                          </Badge>
                          {cell.type && (
                            <Badge
                              className={
                                cell.type === "input" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {cell.type === "input" ? "Input" : "Output"}
                            </Badge>
                          )}
                          {cell.color && (
                            <div className="flex items-center gap-1">
                              <Palette className="w-3 h-3 text-gray-500" />
                              <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: cell.color }}
                                title={`Color: ${cell.color}`}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {cell.ports.map((portName) => (
                            <div key={portName} className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {portName}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.totalPorts === 0 && (
            <div className="text-center py-12">
              <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">No ports created yet.</div>
              <p className="text-sm text-gray-400">The example will show all ports combined once they are created.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
