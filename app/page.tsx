"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import { checkAuthStatus } from "@/lib/api"
import type { User } from "@/lib/types"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await checkAuthStatus()
        setUser(userData)
      } catch (error) {
        console.error("Not authenticated:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-background">
        {user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
      </main>
    </ThemeProvider>
  )
}
