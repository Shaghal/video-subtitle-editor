import Link from 'next/link'
import { ArrowRight, Subtitles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 md:py-36 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">

          {/* Background texture */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage: `
                linear-gradient(oklch(1 0 0 / 2.5%) 1px, transparent 1px),
                linear-gradient(90deg, oklch(1 0 0 / 2.5%) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          {/* Amber glow */}
          <div
            className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-[0.12] blur-3xl"
            aria-hidden="true"
            style={{ background: 'oklch(0.78 0.17 62)' }}
          />

          <div className="relative flex flex-col items-center text-center py-20 px-6 gap-6">
            {/* Logo mark */}
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-2">
              <Subtitles className="w-6 h-6 text-primary-foreground" />
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance max-w-xl">
              Your video. Your subtitles. Your browser.
            </h2>

            <p className="text-base text-muted-foreground max-w-md leading-relaxed text-pretty">
              No account. No upload limit. No subscription. SubCraft runs entirely on your device — your files never leave your machine.
            </p>

            <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
              >
                Open the Editor — it&apos;s free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-xs text-muted-foreground/40 mt-1">
              Powered by <span className="font-mono">@tscaps/engine</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
