'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Palette,
  Clock,
  Type,
  Download,
  Film,
  Layers,
  Move,
  Wand2,
} from 'lucide-react'

const features = [
  {
    icon: Film,
    title: 'Live preview',
    description: 'See your subtitles rendered in real-time as you edit fonts, colors, timing, and placement.',
    wide: false,
  },
  {
    icon: Palette,
    title: 'Full style control',
    description: 'Customize font family, size, color, outline/stroke, backdrop, shadows, and bold/italic styling.',
    wide: false,
  },
  {
    icon: Clock,
    title: 'Timing editor',
    description: 'Adjust subtitle timing millisecond-perfect with inline cue editing, playback-scrubbing, and click-to-sync.',
    wide: false,
  },
  {
    icon: Download,
    title: 'Download .srt',
    description: 'Export your edited subtitle file in standard SubRip format, ready for use with any video player.',
    wide: false,
  },
  {
    icon: Type,
    title: 'Google Fonts support',
    description: 'Import any Google Font by name — Roboto, Playfair Display, Inconsolata — instantly available in the editor.',
    wide: false,
  },
  {
    icon: Move,
    title: 'Subtitle placement',
    description: 'Position subtitles at the top, center, or bottom of the frame — where they belong for your content.',
    wide: false,
  },
  {
    icon: Layers,
    title: 'Backdrop & outline',
    description: 'Add a customizable backdrop pill or text outline to ensure subtitles are always readable over any video.',
    wide: false,
  },
  {
    icon: Wand2,
    title: 'Hardsub export',
    description: 'Burn styled subtitles directly into the video, pixel-perfect, entirely in your browser using @tscaps/engine.',
    wide: true,
  },
]

function FeatureCard({ feature, index, isVisible }: { feature: typeof features[0]; index: number; isVisible: boolean }) {
  const Icon = feature.icon
  return (
    <div
      className={`p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur hover:border-primary/30 hover:bg-surface/80 hover:shadow-lg hover:shadow-primary/10 group transition-all duration-500 ${
        feature.wide ? 'sm:col-span-2' : ''
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-primary/0 group-hover:bg-primary/5 rounded-lg blur transition-all duration-300" />
        <div className="relative">
          <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
          <p className="text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-300">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState(new Array(features.length).fill(false))
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleCards((prev) => {
              const newVisible = [...prev]
              newVisible[index] = true
              return newVisible
            })
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-index]')
    cards?.forEach((card) => observer.observe(card))

    return () => cards?.forEach((card) => observer.unobserve(card))
  }, [])

  return (
    <section id="features" ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium text-primary/80 tracking-widest uppercase">Features</p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Everything you need
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A complete toolkit for styling, timing, and exporting subtitles — all in your browser.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} data-index={idx} className="h-full">
            <FeatureCard feature={feature} index={idx} isVisible={visibleCards[idx]} />
          </div>
        ))}
      </div>
    </section>
  )
}
