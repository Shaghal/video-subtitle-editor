import Link from 'next/link'
import { Subtitles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Subtitles className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
          Your video. Your subtitles. Your browser.
        </h2>

        {/* Subheading */}
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          No installations, no uploads to third-party servers. Your video and subtitles never leave your device.
        </p>

        {/* CTA button */}
        <div>
          <Link
            href="/editor"
            className="inline-block px-8 py-4 rounded-lg bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity"
          >
            Open the Editor — it&apos;s free
          </Link>
        </div>
      </div>
    </section>
  )
}
