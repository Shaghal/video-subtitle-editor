import Link from 'next/link'
import { Subtitles } from 'lucide-react'

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Subtitles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">SubCraft</span>
        </Link>

        {/* Navigation links */}
        <div className="hidden sm:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
        </div>

        {/* CTA button */}
        <Link
          href="/editor"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Open Editor
        </Link>
      </div>
    </nav>
  )
}
