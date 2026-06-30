import { Film, Sliders, PackageOpen } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Film,
    title: 'Drop your files',
    description:
      'Drag and drop your video (MP4, WebM, MOV) and an .srt subtitle file onto the editor. No account needed.',
  },
  {
    number: '02',
    icon: Sliders,
    title: 'Style and adjust',
    description:
      'Choose font, size, color, stroke, and backdrop. Edit cue timings. Set the subtitle placement. Everything updates live on the video.',
  },
  {
    number: '03',
    icon: PackageOpen,
    title: 'Export',
    description:
      'Download your modified .srt, or click "Render & Download" to burn styled subtitles permanently into the video — no server involved.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="max-w-xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground text-balance">
            Three steps.
            <br />
            <span className="text-muted-foreground font-semibold">From raw footage to finished video.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative bg-card p-8 flex flex-col gap-5 group hover:bg-surface-raised transition-colors"
              >
                {/* Step number + connector line */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-primary/60 tracking-widest">
                    {step.number}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-border" aria-hidden="true" />
                  )}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-all">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
