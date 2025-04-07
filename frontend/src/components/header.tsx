"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ]

  const authRoutes = user
    ? [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname === "/dashboard",
        },
        {
          href: "/chat",
          label: "Chat with Bot",
          active: pathname === "/chat",
        },
      ]
    : [
        {
          href: "/login",
          label: "Login",
          active: pathname === "/login",
        },
        {
          href: "/register",
          label: "Register",
          active: pathname === "/register",
        },
      ]

  const adminRoutes =
    user?.role === "admin"
      ? [
          {
            href: "/admin",
            label: "Admin Panel",
            active: pathname === "/admin",
          },
        ]
      : []

  const allRoutes = [...routes, ...authRoutes, ...adminRoutes]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">PriceBot</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {allRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
          {user && (
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          )}
          <ModeToggle />
        </nav>

        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" aria-label="Toggle Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="container md:hidden py-4">
          <nav className="flex flex-col space-y-4">
            {allRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            {user && (
              <Button variant="ghost" onClick={logout} className="justify-start px-0">
                Logout
              </Button>
            )}
            <div className="pt-2">
              <ModeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

