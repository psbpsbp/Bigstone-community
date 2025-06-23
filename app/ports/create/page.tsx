import CreatePortForm from "@/components/ports/create-port-form"

export default function CreatePortPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Port</h1>
          <p className="mt-2 text-gray-600">
            Follow the BIGSTONE Port Standards to create a new port definition. Place inputs and outputs on the grid to
            automatically determine the port direction.
          </p>
        </div>
        <CreatePortForm />
      </div>
    </div>
  )
}
