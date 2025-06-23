"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, FolderOpen, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DatabaseStatus from "@/components/ui/database-status"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/lib/session"
import Header from "@/components/layout/header"

interface Project {
  id: string
  name: string
  description: string
  created_at: string
  created_by: string
}

export default function ProjectsPage() {
  const { user } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProjects(filtered)
  }, [projects, searchTerm])

  const fetchProjects = async () => {
    if (!supabase) {
      setError("Database connection not configured. Please add Supabase integration to access projects.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the project "${projectName}"? This action cannot be undone and will also delete all chat messages, announcements, and schematics.`,
      )
    ) {
      return
    }

    if (!supabase) {
      setError("Database connection not configured")
      return
    }

    setDeletingId(projectId)
    setError("")

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      // Remove from local state
      setProjects((prev) => prev.filter((project) => project.id !== projectId))
    } catch (err: any) {
      setError(err.message || "Failed to delete project")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-lg">Loading projects...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Community Projects</h1>
            <p className="mt-2 text-gray-600">Discover and share amazing projects built by the community</p>
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
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button asChild>
              <Link href="/projects/create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Project
              </Link>
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/projects/${project.id}`}>View Project</Link>
                        </Button>
                        {/* Only show remove button if user is the creator */}
                        {user && user.id === project.created_by && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            disabled={deletingId === project.id}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            {deletingId === project.id ? "Deleting..." : "Remove"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && !loading && supabase && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">
                {searchTerm ? "No projects found matching your search." : "No projects created yet."}
              </div>
              <Button asChild>
                <Link href="/projects/create">Create the First Project</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
