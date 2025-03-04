"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Nav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const NavLinks = () => (
    <div className="flex flex-col space-y-2">
      <Link href="/" className="w-full">
        <Button variant="ghost" className={`w-full justify-start text-white hover:text-white/80 ${pathname === "/" ? "bg-white/10" : ""}`}>
          Home
        </Button>
      </Link>
      {user && (
        <>
          <Link href="/history" className="w-full">
            <Button variant="ghost" className={`w-full justify-start text-white hover:text-white/80 ${pathname === "/history" ? "bg-white/10" : ""}`}>
              History
            </Button>
          </Link>
          <Link href="/profile" className="w-full">
            <Button variant="ghost" className={`w-full justify-start text-white hover:text-white/80 ${pathname === "/profile" ? "bg-white/10" : ""}`}>
              Profile
            </Button>
          </Link>
        </>
      )}
      {!user && (
        <>
          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className={`w-full justify-start text-white hover:text-white/80 ${pathname === "/auth/login" ? "bg-white/10" : ""}`}>
              Login
            </Button>
          </Link>
          <Link href="/auth/signup" className="w-full">
            <Button variant="ghost" className={`w-full justify-start text-white hover:text-white/80 ${pathname === "/auth/signup" ? "bg-white/10" : ""}`}>
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </div>
  )

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="container flex h-16 items-center px-4">
          {/* Menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 text-white hover:text-white/80 hover:bg-white/10"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* App name */}
          <Link href="/" className="text-xl font-bold text-white">
            Gym Tracker
          </Link>

          {/* Logout button - only show if user is logged in */}
          {user && (
            <Button
              variant="ghost"
              onClick={logout}
              className="ml-auto text-white hover:text-white/80 hover:bg-white/10"
            >
              Logout
            </Button>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={toggleMenu}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-black border-r border-white/10 shadow-lg">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
              </div>
              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavLinks />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 