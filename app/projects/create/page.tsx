import CreateProjectForm from "@/components/projects/create-project-form"
import ProtectedRoute from "@/components/auth/protected-route"
import Header from "@/components/layout/header"

export default function CreateProjectPage() {
  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="mt-2 text-gray-600">Share your project with the community</p>
          </div>
          <CreateProjectForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
