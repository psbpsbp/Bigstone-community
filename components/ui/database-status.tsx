"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, AlertCircle } from "lucide-react"

interface DatabaseStatusProps {
  error: string
}

export default function DatabaseStatus({ error }: DatabaseStatusProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Database Not Connected</CardTitle>
            <CardDescription>The Supabase database needs to be configured to use this feature</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">To fix this:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Click "Add Integration" in the top right corner</li>
                <li>Select "Supabase" from the integrations list</li>
                <li>Follow the setup instructions</li>
                <li>Run the database scripts to create tables</li>
                <li>Refresh this page</li>
              </ol>
            </div>

            <div className="text-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
