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

const FEATURES = [
  {
    icon: Film,
    title: 'Live preview',
    description:
      'See your subtitles overlaid on the video in real time as you tweak font, color, size, and position.',
    wide: false,
  },
  {
    icon: Palette,
    title: 'Full style control',
    description:
      'Change font family (including custom Google Fonts), size, color, stroke, shadow, and backdrop — all from a compact panel.',
    wide: false,
  },
  {
    icon: Clock,
    title: 'Timing editor',
    description:
      'Click any cue to jump the video to that moment. Edit start/end times inline, add new cues, or delete existing ones.',
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
      'Add a color backdrop behind text or a stroke outline, each with custom color and opacity. Readable on any scene.',
    wide: false,
  },
  {
    icon: Type,
    title: 'Import any font',
    description:
      'Type any Google Font name and import it instantly. It shows up in the player and in the hardsub output.',
    wide: false,
  },
  {
    icon: Download,
    title: 'Download .srt',
    description:
      'Export your edited subtitle timings as a clean .srt file to use anywhere — no metadata, no filler.',
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
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="max-w-xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground text-balance">
            Everything in one place.
            <br />
            <span className="text-muted-foreground font-semibold">Nothing you don&apos;t need.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className={[
                  'group relative rounded-xl border border-border bg-card p-6 flex flex-col gap-4',
                  'hover:border-primary/30 hover:bg-card transition-all duration-200',
                  feat.wide ? 'lg:col-span-2' : '',
                ].join(' ')}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-all">
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>

                {/* Subtle corner glow on hover */}
                <div
                  className="pointer-events-none absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  aria-hidden="true"
                  style={{
                    background:
                      'radial-gradient(circle at bottom right, oklch(0.78 0.17 62 / 12%), transparent 70%)',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
