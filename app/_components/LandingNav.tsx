'use client'

import Link from 'next/link'
import { Subtitles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/90 backdrop-blur border-b border-border/50 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Subtitles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">SubCraft</span>
        </Link>

        <div className="hidden sm:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            How it Works
          </a>
        </div>

        <Link
          href="/editor"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
        >
          Open Editor
        </Link>
      </div>
    </nav>
  )
}
