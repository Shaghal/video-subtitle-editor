import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Text */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Subtitles that <span className="text-primary">stay</span> with your video
            </h1>
            <p className="text-lg text-muted-foreground">
              Style fonts, adjust timing, and burn hardcoded subtitles directly into your video — entirely in your browser. No installation, no uploads, no limits.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/editor"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-center hover:opacity-90 transition-opacity"
            >
              Open the Editor — it&apos;s free
            </Link>
            <a
              href="#features"
              className="px-6 py-3 rounded-lg border border-border bg-surface text-foreground font-medium text-center hover:bg-surface-raised transition-colors"
            >
              Learn more
            </a>
          </div>

          {/* Trust badges */}
          <div className="pt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>100% client-side</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>No files uploaded</span>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative aspect-video rounded-xl border border-border overflow-hidden bg-surface">
          <Image
            src="/hero-mockup.png"
            alt="SubCraft video editor interface showing a cinematic landscape with amber subtitle text overlay"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}
