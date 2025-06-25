import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const referer = request.headers.get("referer") || ""

  if (referer.includes("bigstone.ovh")) {
    // Redirect visitors coming from bigstone.ovh to /welcome route
    return NextResponse.redirect(new URL("/welcome", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/play/:path*", "/welcome/:path*"], // apply only to these routes
}
