import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, FileText, FolderOpen, Grid3X3, Plus, Eye } from "lucide-react"
import Header from "@/components/layout/header"

export default function DashboardPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Welcome to Bigstone Community</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Access all community features following BIGSTONE standards
            </p>
          </div>

          {/* Main Navigation Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Cpu className="w-6 h-6 text-blue-600" />
                  Ports
                </CardTitle>
                <CardDescription className="text-sm">
                  Digital circuit ports following BIGSTONE standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-slate-600">
                  <p>• 16x16 grid layout system</p>
                  <p>• Standardized naming</p>
                  <p>• Input/Output definitions</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/ports">
                      <Eye className="w-4 h-4 mr-1" />
                      Browse
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/ports/create">
                      <Plus className="w-4 h-4 mr-1" />
                      Create
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="w-6 h-6 text-green-600" />
                  Standards
                </CardTitle>
                <CardDescription className="text-sm">Community guidelines and voting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-slate-600">
                  <p>• 24-hour voting period</p>
                  <p>• Democratic decisions</p>
                  <p>• Transparent process</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/standards">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/standards/create">
                      <Plus className="w-4 h-4 mr-1" />
                      Propose
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                  Projects
                </CardTitle>
                <CardDescription className="text-sm">Community projects and builds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-slate-600">
                  <p>• Share your builds</p>
                  <p>• Use community ports</p>
                  <p>• Collaborate with others</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/projects">
                      <Eye className="w-4 h-4 mr-1" />
                      Browse
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/projects/create">
                      <Plus className="w-4 h-4 mr-1" />
                      Create
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Grid3X3 className="w-6 h-6 text-orange-600" />
                  Example
                </CardTitle>
                <CardDescription className="text-sm">All ports combined in one grid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-slate-600">
                  <p>• All ports from ports tab</p>
                  <p>• Combined 16x16 view</p>
                  <p>• Auto-generated</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="w-full">
                    <Link href="/examples">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="text-center"></div>
        </div>
      </div>
    </>
  )
}
