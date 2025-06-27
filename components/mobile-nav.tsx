"use client"

import { useState } from "react"
import { Menu, X, Home, Settings, Info, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between p-4 border-b">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <h1 className="text-lg font-semibold">IoT Monitor</h1>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <Info className="mr-2 h-5 w-5" />
              About
            </Button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
