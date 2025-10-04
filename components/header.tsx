"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { data: session, status } = useSession()
  
  const navItems = [
    { name: "Features", href: "#features-section" },
    { name: "FAQ", href: "#faq-section" },
    { name: "Dashboard", href: '/Dashboard' },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="w-full py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-foreground text-xl font-semibold">FlowSprint.AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-full font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="hidden md:block">
              <Button variant="ghost" disabled className="px-4 py-2 rounded-full bg-white text-black">
                Loading...
              </Button>
            </div>
          ) : session ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/Dashboard">
                <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-full font-medium">
                  {session.user?.image && (
                    <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full" />
                  )}
                  <span>{session.user?.name || "Dashboard"}</span>
                </Button>
              </Link>
              <Button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin" className="hidden md:block">
              <Button
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-muted-foreground hover:text-foreground justify-start text-lg py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                {session ? (
                  <div className="flex flex-col gap-4 mt-4">
                    <Link href="/Dashboard" className="w-full">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-full font-medium">
                        <User className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                    <Button
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-full font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth/signin" className="w-full mt-4">
                    <Button className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm">
                      <User className="h-5 w-5" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
