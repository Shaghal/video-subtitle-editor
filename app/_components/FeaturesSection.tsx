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
    description:
      'Customize font family, size, color, outline/stroke, backdrop, shadows, and bold/italic styling.',
    wide: false,
  },
  {
    icon: Clock,
    title: 'Timing editor',
    description:
      'Adjust subtitle timing millisecond-perfect with inline cue editing, playback-scrubbing, and click-to-sync.',
    wide: false,
  },
  {
    icon: Download,
    title: 'Download .srt',
    description:
      'Export your edited subtitle file in standard SubRip format, ready for use with any video player.',
    wide: false,
  },
  {
    icon: Type,
    title: 'Google Fonts support',
    description:
      'Import any Google Font by name — Roboto, Playfair Display, Inconsolata — instantly available in the editor.',
    wide: false,
  },
  {
    icon: Move,
    title: 'Subtitle placement',
    description:
      'Position subtitles at the top, center, or bottom of the frame — where they belong for your content.',
    wide: false,
  },
  {
    icon: Layers,
    title: 'Backdrop & outline',
    description:
      'Add a customizable backdrop pill or text outline to ensure subtitles are always readable over any video.',
    wide: false,
  },
  {
    icon: Wand2,
    title: 'Hardsub export',
    description:
      'Burn styled subtitles directly into the video, pixel-perfect, entirely in your browser using @tscaps/engine.',
    wide: true,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-primary mb-4">FEATURES</p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Everything you need to edit subtitles
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A complete toolkit for styling, timing, and exporting subtitles — all in your browser.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={idx}
              className={`p-6 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors ${
                feature.wide ? 'sm:col-span-2' : ''
              }`}
            >
              <Icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
