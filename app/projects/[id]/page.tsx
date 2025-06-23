"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Megaphone, FileText, Send, Upload, Download, ArrowLeft, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSession } from "@/lib/session"
import ProtectedRoute from "@/components/auth/protected-route"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string
  created_by: string
  created_at: string
}

interface ChatMessage {
  id: string
  user_id: string
  message: string
  created_at: string
  username?: string
}

interface Announcement {
  id: string
  update_number: number
  title: string
  content: string
  created_at: string
  username?: string
}

interface Schematic {
  id: string
  filename: string
  file_url: string
  file_size: number
  file_type: string
  description: string
  created_at: string
  username?: string
}

export default function ProjectDetailPage() {
  const { user } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [schematics, setSchematics] = useState<Schematic[]>([])

  const [newMessage, setNewMessage] = useState("")
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDescription, setUploadDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploadLoading, setUploadLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    if (!supabase) {
      setError("Database connection not configured")
      setLoading(false)
      return
    }

    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch chat messages with usernames
      const { data: chatData, error: chatError } = await supabase
        .from("project_chat_messages")
        .select(`
          *,
          users!project_chat_messages_user_id_fkey(username)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })

      if (chatError) throw chatError
      const messagesWithUsernames = (chatData || []).map((msg: any) => ({
        ...msg,
        username: msg.users?.username || "Unknown User",
      }))
      setChatMessages(messagesWithUsernames)

      // Fetch announcements with usernames
      const { data: announcementData, error: announcementError } = await supabase
        .from("project_announcements")
        .select(`
          *,
          users!project_announcements_user_id_fkey(username)
        `)
        .eq("project_id", projectId)
        .order("update_number", { ascending: false })

      if (announcementError) throw announcementError
      const announcementsWithUsernames = (announcementData || []).map((ann: any) => ({
        ...ann,
        username: ann.users?.username || "Unknown User",
      }))
      setAnnouncements(announcementsWithUsernames)

      // Fetch schematics with usernames
      const { data: schematicData, error: schematicError } = await supabase
        .from("project_schematics")
        .select(`
          *,
          users!project_schematics_user_id_fkey(username)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (schematicError) throw schematicError
      const schematicsWithUsernames = (schematicData || []).map((sch: any) => ({
        ...sch,
        username: sch.users?.username || "Unknown User",
      }))
      setSchematics(schematicsWithUsernames)
    } catch (err: any) {
      setError(err.message || "Failed to fetch project data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project || !supabase || !user) return

    if (
      !confirm(
        `Are you sure you want to delete the project "${project.name}"? This action cannot be undone and will delete all chat messages, announcements, and schematics.`,
      )
    ) {
      return
    }

    setDeleteLoading(true)
    setError("")

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      // Redirect to projects page after successful deletion
      router.push("/projects")
    } catch (err: any) {
      setError(err.message || "Failed to delete project")
    } finally {
      setDeleteLoading(false)
    }
  }

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !supabase || !user) return

    try {
      const { error } = await supabase.from("project_chat_messages").insert([
        {
          project_id: projectId,
          user_id: user.id,
          message: newMessage.trim(),
        },
      ])

      if (error) throw error

      setNewMessage("")
      fetchProjectData() // Refresh messages
    } catch (err: any) {
      setError(err.message || "Failed to send message")
    }
  }

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim() || !supabase || !user) return

    try {
      // Get next announcement number
      const { data: nextNum, error: rpcError } = await supabase.rpc("get_next_announcement_number", {
        project_uuid: projectId,
      })

      if (rpcError) throw rpcError

      const { error: insertError } = await supabase.from("project_announcements").insert([
        {
          project_id: projectId,
          user_id: user.id,
          update_number: nextNum || 1,
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
        },
      ])

      if (insertError) throw insertError

      setNewAnnouncement({ title: "", content: "" })
      fetchProjectData() // Refresh announcements
    } catch (err: any) {
      setError(err.message || "Failed to create announcement")
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile || !supabase || !user) return

    setUploadLoading(true)
    setError("")

    try {
      // Create a simple file URL (in a real app, you'd upload to storage)
      const fileUrl = `https://example.com/files/${uploadFile.name}`

      const { error: insertError } = await supabase.from("project_schematics").insert([
        {
          project_id: projectId,
          user_id: user.id,
          filename: uploadFile.name,
          file_url: fileUrl,
          file_size: uploadFile.size,
          file_type: uploadFile.type || "application/octet-stream",
          description: uploadDescription.trim() || uploadFile.name,
        },
      ])

      if (insertError) throw insertError

      setUploadFile(null)
      setUploadDescription("")
      fetchProjectData() // Refresh schematics
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setUploadLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-lg">Loading project...</div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-lg text-red-600">Project not found</div>
        </div>
      </div>
    )
  }

  const isProjectOwner = user && user.id === project.created_by

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-2 text-gray-600">{project.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                </Button>
                {/* Only show delete button if user is the project creator */}
                {isProjectOwner && (
                  <Button
                    onClick={handleDeleteProject}
                    disabled={deleteLoading}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteLoading ? "Deleting..." : "Delete Project"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Project Tabs */}
          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat ({chatMessages.length})
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Announcements ({announcements.length})
              </TabsTrigger>
              <TabsTrigger value="schematics" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Schematics ({schematics.length})
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle>Project Chat</CardTitle>
                  <CardDescription>Discuss this project with other community members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="flex flex-col space-y-1">
                          <div className="text-sm text-gray-500">
                            {message.username} • {new Date(message.created_at).toLocaleString()}
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">{message.message}</div>
                        </div>
                      ))}
                      {chatMessages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
                      )}
                    </div>

                    {/* Send Message */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                      />
                      <Button onClick={sendChatMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements">
              <div className="space-y-6">
                {/* Create Announcement */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create Update</CardTitle>
                    <CardDescription>Post an update for this project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="announcement-title">Update Title</Label>
                      <Input
                        id="announcement-title"
                        placeholder="e.g., Added new features"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="announcement-content">Update Content</Label>
                      <Textarea
                        id="announcement-content"
                        placeholder="Describe what's new in this update..."
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <Button
                      onClick={createAnnouncement}
                      disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
                    >
                      Post Update
                    </Button>
                  </CardContent>
                </Card>

                {/* Announcements List */}
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Update #{announcement.update_number}</Badge>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        </div>
                        <CardDescription>
                          By {announcement.username} • {new Date(announcement.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No updates posted yet.</div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Schematics Tab */}
            <TabsContent value="schematics">
              <div className="space-y-6">
                <Alert variant="default">
                  <AlertDescription>
                    <strong>Note:</strong> To upload schematic, upload it to <a href="https://drive.google.com/drive/folders/1XUrSFkjh8wvqizTHwZK7ly7JZyZXDHLp?usp=sharing" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">[the shared google drive folder for all schematics]</a> first and make an announcement, since schematics aren't operational just yet.
                  </AlertDescription>
                </Alert>

                {/* Upload Schematic */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Schematic</CardTitle>
                    <CardDescription>Share files related to this project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Select File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip,.rar,.7z,.schematic,.json,.xml"
                      />
                      {uploadFile && (
                        <div className="text-sm text-gray-600">
                          Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file-description">Description (Optional)</Label>
                      <Input
                        id="file-description"
                        placeholder="Describe what this file contains..."
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleFileUpload} disabled={!uploadFile || uploadLoading} className="w-full">
                      {uploadLoading ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Schematics List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schematics.map((schematic) => (
                    <Card key={schematic.id}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {schematic.filename}
                        </CardTitle>
                        <CardDescription>{schematic.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <p>Type: {schematic.file_type}</p>
                            <p>Size: {formatFileSize(schematic.file_size)}</p>
                            <p>Uploaded by: {schematic.username}</p>
                            <p>Date: {new Date(schematic.created_at).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" className="w-full" asChild>
                            <a href={schematic.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {schematics.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">No schematics uploaded yet.</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
