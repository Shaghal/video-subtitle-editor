'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text with animations */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                Subtitles that{' '}
                <span className="relative inline-block">
                  <span className="absolute inset-0 bg-primary/20 blur-lg" />
                  <span className="relative text-primary">stay</span>
                </span>{' '}
                with your video
              </h1>

              <p
                className={`text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-1000 delay-100 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                Style fonts, adjust timing, and burn hardcoded subtitles directly into your video — entirely in your
                browser. No installation, no uploads, no limits.
              </p>
            </div>

            {/* CTA buttons with stagger animation */}
            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-200 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Link
                href="/editor"
                className="group px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-center hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all duration-200"
              >
                Open the Editor — it&apos;s free
              </Link>
              <a
                href="#features"
                className="px-6 py-3 rounded-lg border border-border bg-transparent text-foreground font-medium text-center hover:bg-surface/50 transition-all duration-200"
              >
                Explore features
              </a>
            </div>

            {/* Trust badges with fade-in */}
            <div
              className={`pt-4 flex flex-wrap gap-6 text-sm text-muted-foreground transition-all duration-1000 delay-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
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

          {/* Right: Image with parallax and hover effect */}
          <div
            className={`relative aspect-video rounded-xl border border-border/50 overflow-hidden bg-surface group transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent pointer-events-none group-hover:via-primary/5 transition-all duration-300" />
            <Image
              src="/hero-mockup.png"
              alt="SubCraft video editor interface showing a cinematic landscape with amber subtitle text overlay"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 shadow-2xl group-hover:shadow-primary/20 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
