import type { Reading, HistoricalData, LcdConfig, User } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Authentication functions
export async function login(username: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function checkAuthStatus(): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Auth check failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// User management functions
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  role: string
}): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`)
    }
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Sensor data functions
export async function fetchLatestReading(): Promise<Reading> {
  try {
    const response = await fetch(`${API_URL}/api/readings/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch latest reading: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function fetchHistoricalData(timeframe: "24h" | "7d" | "30d"): Promise<HistoricalData> {
  try {
    const response = await fetch(`${API_URL}/api/readings/history?timeframe=${timeframe}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// LCD Configuration functions
export async function fetchLcdConfig(): Promise<LcdConfig> {
  try {
    const response = await fetch(`${API_URL}/api/lcd-config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch LCD configuration: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export async function updateLcdConfig(configData: {
  mode: 0 | 1 | 2
  message?: string
  backlight: boolean
}): Promise<LcdConfig> {
  try {
    const response = await fetch(`${API_URL}/api/lcd-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(configData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update LCD configuration: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Report generation function
export async function generateReport(reportConfig: {
  type: "daily" | "weekly" | "monthly" | "yearly"
  startDate: string
  endDate?: string
}): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/reports/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(reportConfig),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`)
    }

    return response.text()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}
