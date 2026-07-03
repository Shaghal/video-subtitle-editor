import Link from 'next/link'
import { Subtitles } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          {/* Branding */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Subtitles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">SubCraft</span>
            </Link>
            <p className="text-sm text-muted-foreground">Subtitle editor for the modern web.</p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-medium">Product</p>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Learn</p>
              <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">App</p>
              <Link href="/editor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Editor
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border py-8">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 SubCraft. Open-source, built with Next.js and @tscaps/engine.
          </p>
        </div>
      </div>
    </footer>
  )
}
