'use client'

import { useState } from 'react'
import { Download, Film, FileText, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { SubtitleCue, SubtitleStyle, serializeSrt, buildCaptionCss } from '@/lib/srt'
import { cn } from '@/lib/utils'

interface ExportPanelProps {
  cues: SubtitleCue[]
  style: SubtitleStyle
  videoBlob: Blob | null
  videoName: string | null
}

type HardsubStatus =
  | { type: 'idle' }
  | { type: 'progress'; stage: string; pct: number }
  | { type: 'done'; url: string; filename: string }
  | { type: 'error'; message: string }

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-1.5 bg-surface-overlay rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function ExportPanel({ cues, style, videoBlob, videoName }: ExportPanelProps) {
  const [hardsubStatus, setHardsubStatus] = useState<HardsubStatus>({ type: 'idle' })

  /* ── Download SRT only ─────────────────────────────────────── */
  const handleDownloadSrt = () => {
    if (cues.length === 0) return
    const content = serializeSrt(cues)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (videoName?.replace(/\.[^.]+$/, '') ?? 'subtitles') + '.srt'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Hardsub (burn subtitles into video) ───────────────────── */
  const handleHardsub = async () => {
    if (!videoBlob || cues.length === 0) return

    setHardsubStatus({ type: 'progress', stage: 'Initialising pipeline…', pct: 2 })

    try {
      // Dynamic import — @tscaps/engine is browser-only
      const { RenderPipelineBuilder, SrtTranscriber } = await import('@tscaps/engine')

      const srtText = serializeSrt(cues)
      const captionCss = buildCaptionCss(style)

      const pipeline = new RenderPipelineBuilder()
        .withInputVideo(videoBlob)
        .withTranscriber(new SrtTranscriber(srtText))
        .withCss(captionCss)
        .build()

      const { blob } = await pipeline.run((event: { stage: string; progress: number }) => {
        const stageLabels: Record<string, string> = {
          transcription: 'Transcribing…',
          splitting: 'Splitting segments…',
          tagging: 'Tagging…',
          rendering: 'Rendering frames…',
        }
        const label = stageLabels[event.stage] ?? event.stage
        const pct = Math.round(event.progress * 100)
        setHardsubStatus({ type: 'progress', stage: label, pct: Math.max(5, pct) })
      })

      const filename =
        (videoName?.replace(/\.[^.]+$/, '') ?? 'video') + '_hardsubbed.mp4'
      const url = URL.createObjectURL(blob)
      setHardsubStatus({ type: 'done', url, filename })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error during rendering.'
      setHardsubStatus({ type: 'error', message })
    }
  }

  const handleDownloadHardsub = () => {
    if (hardsubStatus.type !== 'done') return
    const a = document.createElement('a')
    a.href = hardsubStatus.url
    a.download = hardsubStatus.filename
    a.click()
  }

  const resetHardsub = () => setHardsubStatus({ type: 'idle' })

  const canExport = cues.length > 0
  const canHardsub = cues.length > 0 && videoBlob !== null

  return (
    <div className="flex flex-col gap-5">
      {/* Section: Download SRT */}
      <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Download Subtitle</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Export your edited subtitle cues as a standard .srt file, including all timing edits.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadSrt}
          disabled={!canExport}
          className={cn(
            'flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            canExport
              ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
              : 'bg-surface-overlay border border-border text-muted-foreground cursor-not-allowed opacity-60'
          )}
        >
          <Download className="w-4 h-4" />
          Download .srt
          {cues.length > 0 && (
            <span className="ml-auto text-xs text-primary/60 font-mono">
              {cues.length} cues
            </span>
          )}
        </button>

        {!canExport && (
          <p className="text-xs text-muted-foreground/60 text-center">
            Load an .srt file first to enable export.
          </p>
        )}
      </div>

      {/* Section: Hardsub */}
      <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Burn into Video (Hardsub)</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Permanently render the styled subtitles into the video frames and export a new .mp4. Runs entirely in your browser — no server, no upload.
            </p>
          </div>
        </div>

        {/* Status states */}
        {hardsubStatus.type === 'idle' && (
          <button
            onClick={handleHardsub}
            disabled={!canHardsub}
            className={cn(
              'flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
              canHardsub
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                : 'bg-surface-overlay border border-border text-muted-foreground cursor-not-allowed opacity-60'
            )}
          >
            <Film className="w-4 h-4" />
            Render & Download Hardsub
          </button>
        )}

        {hardsubStatus.type === 'progress' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                {hardsubStatus.stage}
              </span>
              <span className="font-mono text-primary">{hardsubStatus.pct}%</span>
            </div>
            <ProgressBar pct={hardsubStatus.pct} />
            <p className="text-xs text-muted-foreground/50 text-center">
              This may take a few minutes depending on video length.
            </p>
          </div>
        )}

        {hardsubStatus.type === 'done' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Render complete!</span>
            </div>
            <button
              onClick={handleDownloadHardsub}
              className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Download className="w-4 h-4" />
              Download {hardsubStatus.filename}
            </button>
            <button
              onClick={resetHardsub}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Reset and render again
            </button>
          </div>
        )}

        {hardsubStatus.type === 'error' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{hardsubStatus.message}</span>
            </div>
            <button
              onClick={resetHardsub}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Try again
            </button>
          </div>
        )}

        {!canHardsub && hardsubStatus.type === 'idle' && (
          <div className="text-xs text-muted-foreground/60 text-center space-y-1">
            {!videoBlob && <p>Load a video file to enable hardsub.</p>}
            {!canExport && <p>Load an .srt file to enable hardsub.</p>}
          </div>
        )}
      </div>

      {/* Browser compatibility note */}
      <div className="rounded-lg border border-border/50 bg-surface p-3 flex items-start gap-2.5">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Hardsub rendering requires WebCodecs API. Supported in Chrome 94+, Edge 94+, and Safari 16.4+. Firefox support varies.
        </p>
      </div>
    </div>
  )
}
