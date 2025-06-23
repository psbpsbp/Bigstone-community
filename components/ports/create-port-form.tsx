"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, ArrowLeft } from "lucide-react"
import PortGrid from "./port-grid"
import { supabase } from "@/lib/supabase"

interface GridCell {
  x: number
  y: number
  type: "input" | "output" | null
}

export default function CreatePortForm() {
  const [formData, setFormData] = useState({
    type: "",
    portCount: 1,
    role: "SD",
    description: "",
  })
  const [gridData, setGridData] = useState<GridCell[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const analyzeGridDirection = (gridData: GridCell[]) => {
    const hasInput = gridData.some((cell) => cell.type === "input")
    const hasOutput = gridData.some((cell) => cell.type === "output")

    if (hasInput && hasOutput) return "B" // Bidirectional
    if (hasInput) return "I" // Input only
    if (hasOutput) return "O" // Output only
    return "" // No ports placed
  }

  const generatePortName = () => {
    const direction = analyzeGridDirection(gridData)
    if (!direction || !formData.type) return ""

    let name = `${direction}${formData.type}`

    if (formData.portCount > 1) {
      name += `-${formData.portCount}`
    }

    if (formData.role !== "SD") {
      name += `-${formData.role}`
    }

    return name
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (gridData.length === 0) {
      setError("Please place at least one port on the grid")
      setLoading(false)
      return
    }

    const direction = analyzeGridDirection(gridData)
    if (!direction) {
      setError("Unable to determine port direction from grid")
      setLoading(false)
      return
    }

    // Check if Supabase is configured
    if (!supabase) {
      setError("Database connection not configured. Please set up Supabase environment variables.")
      setLoading(false)
      return
    }

    try {
      const portName = generatePortName()

      const { error: insertError } = await supabase.from("ports").insert([
        {
          name: portName,
          direction: direction,
          type: formData.type,
          port_count: formData.portCount,
          role: formData.role,
          description: formData.description,
          grid_data: gridData,
          created_by: null, // Will be set when proper auth is implemented
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        type: "",
        portCount: 1,
        role: "SD",
        description: "",
      })
      setGridData([])
    } catch (err: any) {
      setError(err.message || "Failed to create port")
    } finally {
      setLoading(false)
    }
  }

  const currentDirection = analyzeGridDirection(gridData)
  const getDirectionLabel = (dir: string) => {
    switch (dir) {
      case "I":
        return "Input"
      case "O":
        return "Output"
      case "B":
        return "Bidirectional"
      default:
        return "No ports placed"
    }
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-green-600">Port Created!</CardTitle>
          <CardDescription>Your port has been successfully added to the community database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Create Another Port
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Home Button */}
      <div className="flex justify-start">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">Create New Port</CardTitle>
          <CardDescription>
            Define a new port following the BIGSTONE Port Standards. Place inputs and outputs on the grid to
            automatically determine direction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIN">Binary (BIN)</SelectItem>
                      <SelectItem value="HEX">Hexadecimal (HEX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portCount">Number of Ports</Label>
                  <Input
                    id="portCount"
                    type="number"
                    min="1"
                    max="16"
                    value={formData.portCount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, portCount: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">Standard (SD)</SelectItem>
                      <SelectItem value="STATE">State</SelectItem>
                      <SelectItem value="CLK">Clock</SelectItem>
                      <SelectItem value="RST">Reset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the port's functionality..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Direction Display */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">Detected Direction:</Label>
                  <div
                    className={`text-lg font-bold ${
                      currentDirection === "I"
                        ? "text-green-600"
                        : currentDirection === "O"
                          ? "text-red-600"
                          : currentDirection === "B"
                            ? "text-blue-600"
                            : "text-gray-500"
                    }`}
                  >
                    {getDirectionLabel(currentDirection)}
                  </div>
                </div>

                {currentDirection && formData.type && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium">Generated Port Name:</Label>
                    <div className="text-lg font-mono font-bold text-blue-600">{generatePortName()}</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Port Layout</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Click on the grid to place input (↑) and output (↓) ports. The direction will be automatically
                    determined from your placement. Coordinates start from (1,1) at the bottom-left.
                  </p>
                  <PortGrid gridData={gridData} onGridChange={setGridData} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Port..." : "Create Port"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
