'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)',
        }}
      />

      {/* Amber glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.08]"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at center, oklch(0.78 0.17 62) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-amber-dim px-3.5 py-1 text-xs font-semibold text-primary mb-8">
          <Sparkles className="w-3 h-3" />
          Powered by @tscaps/engine
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.05] text-foreground max-w-4xl">
          Subtitles that{' '}
          <span className="text-primary">stay with</span>
          {' '}your video
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty">
          Edit, style, and burn subtitles directly into your video — right in the browser. No installs, no uploads to a server, no waiting.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            Open the Editor
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-surface text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-surface-raised transition-all"
          >
            See how it works
          </a>
        </div>

        {/* Hero image */}
        <div className="mt-16 w-full max-w-4xl">
          {/* Glow behind image */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-3/4 h-12 blur-3xl opacity-20"
            aria-hidden="true"
            style={{ background: 'oklch(0.78 0.17 62)', bottom: '10%' }}
          />
          <div className="relative rounded-2xl border border-border overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5">
            <Image
              src="/hero-mockup.png"
              alt="SubCraft subtitle editor interface showing a video with styled amber subtitles and editing controls"
              width={1200}
              height={720}
              className="w-full h-auto block"
              priority
            />
            {/* Top chrome bar */}
            <div className="absolute top-0 inset-x-0 h-8 bg-card/90 backdrop-blur-sm border-b border-border flex items-center px-4 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="ml-3 text-xs text-muted-foreground/50 font-mono">subcraft.app/editor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
