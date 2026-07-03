import { Upload, Wand2, Download } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload video & subtitles',
    description:
      'Drop your video file (MP4, WebM, MOV) and SubRip .srt file into the editor. Everything stays on your device.',
  },
  {
    number: '02',
    icon: Wand2,
    title: 'Style & time',
    description:
      'Customize fonts, colors, placement, and backdrop. Adjust timing with click-to-sync. See changes live.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Export & burn',
    description:
      'Download the edited .srt file, or render and download a hardcoded video with subtitles burned in.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-primary mb-4">HOW IT WORKS</p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Three steps to perfect subtitles
        </h2>
      </div>

      {/* Steps grid */}
      <div className="grid sm:grid-cols-3 gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div key={idx} className="relative">
              {/* Step number background */}
              <div className="absolute -top-4 -left-4 text-6xl font-bold text-primary/10 select-none">
                {step.number}
              </div>

              {/* Card */}
              <div className="relative p-8 rounded-xl border border-border bg-surface h-full">
                <Icon className="w-8 h-8 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
