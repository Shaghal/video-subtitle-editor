'use client'

import Link from 'next/link'
import { Subtitles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 text-center space-y-8">
        {/* Logo with animation */}
        <div
          className={`flex justify-center transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group hover:from-primary/30 hover:to-primary/10 transition-all duration-300">
            <Subtitles className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        {/* Heading with stagger animation */}
        <h2
          className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-2xl mx-auto transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Your video. Your subtitles. Your browser.
        </h2>

        {/* Subheading */}
        <p
          className={`text-lg text-muted-foreground max-w-xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          No installations, no uploads to third-party servers. Your video and subtitles never leave your device.
        </p>

        {/* CTA button with hover effect */}
        <div
          className={`transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            href="/editor"
            className="group inline-block px-8 py-4 rounded-lg bg-primary text-primary-foreground font-medium text-lg hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              Open the Editor — it&apos;s free
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
