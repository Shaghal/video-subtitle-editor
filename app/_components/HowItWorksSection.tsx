'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Wand2, Download } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload video & subtitles',
    description: 'Drop your video file (MP4, WebM, MOV) and SubRip .srt file into the editor. Everything stays on your device.',
  },
  {
    number: '02',
    icon: Wand2,
    title: 'Style & time',
    description: 'Customize fonts, colors, placement, and backdrop. Adjust timing with click-to-sync. See changes live.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Export & burn',
    description: 'Download the edited .srt file, or render and download a hardcoded video with subtitles burned in.',
  },
]

function StepCard({ step, index, isVisible }: { step: typeof steps[0]; index: number; isVisible: boolean }) {
  const Icon = step.icon
  return (
    <div
      className={`relative transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Connector line for non-last items */}
      {index < steps.length - 1 && (
        <div className="hidden sm:block absolute top-20 -right-8 w-16 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
      )}

      <div className="relative group">
        {/* Animated background glow */}
        <div className="absolute -inset-1 bg-primary/10 group-hover:bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Card */}
        <div className="relative p-8 rounded-2xl border border-border/50 bg-surface/50 backdrop-blur hover:border-primary/30 hover:bg-surface/80 transition-all duration-300">
          {/* Step number with large background */}
          <div className="absolute -top-6 -right-6 text-7xl font-bold text-primary/5 select-none group-hover:text-primary/10 transition-all duration-300">
            {step.number}
          </div>

          {/* Content */}
          <div className="relative">
            <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-all duration-300">
              <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
            <p className="text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-300 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState([false, false, false])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSteps([true, true, true])
          }
        })
      },
      { threshold: 0.2 }
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
    <section id="how" ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium text-primary/80 tracking-widest uppercase">How it works</p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Three simple steps</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From upload to export in minutes. No complexity, just results.
        </p>
      </div>

      {/* Steps grid */}
      <div className="grid sm:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <StepCard key={idx} step={step} index={idx} isVisible={visibleSteps[idx]} />
        ))}
      </div>
    </section>
  )
}
