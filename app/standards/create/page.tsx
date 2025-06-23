import CreateStandardForm from "@/components/standards/create-standard-form"
import ProtectedRoute from "@/components/auth/protected-route"

export default function CreateStandardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Propose New Standard</h1>
            <p className="mt-2 text-gray-600">Submit a new standard for community voting</p>
          </div>
          <CreateStandardForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
