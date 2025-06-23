"use client"

// Simple client-side session management
interface User {
  id: string
  username: string
  email: string
}

class SessionManager {
  private static instance: SessionManager
  private user: User | null = null
  private listeners: ((user: User | null) => void)[] = []

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  constructor() {
    // Load user from localStorage on initialization
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("bigstone_user")
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser)
        } catch (e) {
          localStorage.removeItem("bigstone_user")
        }
      }
    }
  }

  setUser(user: User | null) {
    this.user = user
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("bigstone_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("bigstone_user")
      }
    }
    this.notifyListeners()
  }

  getUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return this.user !== null
  }

  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.user))
  }

  signOut() {
    this.setUser(null)
  }
}

export const sessionManager = SessionManager.getInstance()

// React hook for using session
import { useState, useEffect } from "react"

export function useSession() {
  const [user, setUser] = useState<User | null>(sessionManager.getUser())

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe(setUser)
    return unsubscribe
  }, [])

  return {
    user,
    isAuthenticated: sessionManager.isAuthenticated(),
    signOut: () => sessionManager.signOut(),
  }
}
