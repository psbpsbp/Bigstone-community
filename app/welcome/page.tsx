// app/welcome/page.tsx
"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Globe, Users, Gamepad2, MessageCircleMore } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome to Bigstone</h1>
        <p className="text-slate-600 text-lg">Explore the different parts of the Bigstone ecosystem</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="w-5 h-5 text-blue-600" />
              <Link href="https://wiki.bigstone.ovh" target="_blank" className="hover:underline">
                wiki.bigstone.ovh
              </Link>
            </CardTitle>
            <CardDescription>Wiki page (being redirected to community soon)</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-green-600" />
              <Link href="https://community.bigstone.ovh" target="_blank" className="hover:underline">
                community.bigstone.ovh
              </Link>
            </CardTitle>
            <CardDescription>Community page. Discuss, collaborate and create</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Gamepad2 className="w-5 h-5 text-purple-600" />
              <Link href="https://play.bigstone.ovh" target="_blank" className="hover:underline">
                play.bigstone.ovh
              </Link>
            </CardTitle>
            <CardDescription>Play the Minecraft server (1.21.6 works, for Axiom use 1.21.1)</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircleMore className="w-5 h-5 text-indigo-600" />
              <Link href="https://discord.bigstone.ovh" target="_blank" className="hover:underline">
                discord.bigstone.ovh
              </Link>
            </CardTitle>
            <CardDescription>Discord invite</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
