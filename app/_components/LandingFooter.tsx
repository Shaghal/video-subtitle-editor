import Link from 'next/link'
import { Subtitles } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="SubCraft home">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Subtitles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">SubCraft</span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-6" aria-label="Footer navigation">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <Link href="/editor" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Editor
          </Link>
        </nav>

        {/* Legal */}
        <p className="text-xs text-muted-foreground/40">
          &copy; {new Date().getFullYear()} SubCraft. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
