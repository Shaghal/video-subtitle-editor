'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Film, FileText, Subtitles, Palette, Clock, PackageOpen, Eye, EyeOff, Repeat, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubtitleCue, SubtitleStyle, DEFAULT_STYLE, parseSrt } from '@/lib/srt'
import VideoPlayer from '@/components/VideoPlayer'
import SubtitleStylePanel from '@/components/SubtitleStylePanel'
import SubtitleTimingEditor from '@/components/SubtitleTimingEditor'
import ExportPanel from '@/components/ExportPanel'

type EditorTab = 'style' | 'timing' | 'export'

const EDITOR_TABS: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
  { id: 'style',  label: 'Style',  icon: <Palette   className="w-4 h-4" /> },
  { id: 'timing', label: 'Timing', icon: <Clock     className="w-4 h-4" /> },
  { id: 'export', label: 'Export', icon: <PackageOpen className="w-4 h-4" /> },
]

function DropZone({
  accept,
  onFile,
  icon,
  title,
  subtitle,
  filename,
}: {
  accept: string
  onFile: (file: File) => void
  icon: React.ReactNode
  title: string
  subtitle: string
  filename?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <button
      type="button"
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center w-full transition-all cursor-pointer',
        dragging
          ? 'border-primary bg-amber-dim'
          : filename
          ? 'border-primary/40 bg-amber-dim/50'
          : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-raised'
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      aria-label={title}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center border transition-colors',
        filename
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'bg-surface-overlay border-border text-muted-foreground'
      )}>
        {icon}
      </div>
      <div>
        <p className={cn('text-xs font-semibold', filename ? 'text-primary' : 'text-foreground')}>
          {filename ?? title}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>
      </div>
    </button>
  )
}

// Reusable toggle chip used for the three playback controls
function ToggleChip({
  checked,
  onChange,
  icon,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all select-none',
        checked
          ? 'border-primary bg-amber-dim text-primary'
          : 'border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export default function SubCraftPage() {
  const [videoBlob, setVideoBlob]       = useState<Blob | null>(null)
  const [videoSrc, setVideoSrc]         = useState<string | null>(null)
  const [videoName, setVideoName]       = useState<string | null>(null)
  const [cues, setCues]                 = useState<SubtitleCue[]>([])
  const [srtName, setSrtName]           = useState<string | null>(null)
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [activeTab, setActiveTab]       = useState<EditorTab>('style')
  const [currentTime, setCurrentTime]   = useState(0)
  const [activeCueId, setActiveCueId]   = useState<number | null>(null)

  // Playback control toggles
  const [showControls, setShowControls] = useState(true)
  const [loop, setLoop]                 = useState(false)
  const [muted, setMuted]               = useState(false)

  const handleVideoFile = useCallback((file: File) => {
    setVideoSrc((prev) => { if (prev) URL.revokeObjectURL(prev); return null })
    const url = URL.createObjectURL(file)
    setVideoBlob(file)
    setVideoSrc(url)
    setVideoName(file.name)
  }, [])

  const handleSrtFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseSrt(text)
      setCues(parsed)
      setSrtName(file.name)
    }
    reader.readAsText(file)
  }, [])

  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(t)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border flex items-center px-5 gap-4 shrink-0 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Subtitles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground tracking-tight">SubCraft</span>
          <span className="text-xs text-muted-foreground/40 hidden sm:block ml-1">Subtitle Editor</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all font-medium',
            videoSrc
              ? 'border-primary/50 bg-amber-dim text-primary'
              : 'border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-primary'
          )}>
            <Film className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[120px] truncate">{videoName ?? 'Add Video'}</span>
            <input type="file" accept="video/*" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = '' }} />
          </label>

          <label className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all font-medium',
            cues.length > 0
              ? 'border-primary/50 bg-amber-dim text-primary'
              : 'border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-primary'
          )}>
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[120px] truncate">{srtName ?? 'Add .srt'}</span>
            <input type="file" accept=".srt,.txt" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSrtFile(f); e.target.value = '' }} />
          </label>
        </div>
      </header>

      {/* ── Page body ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-6 flex flex-col gap-5">

          {/* Drop zones — shown when files not yet loaded */}
          {(!videoSrc || cues.length === 0) && (
            <div className="grid grid-cols-2 gap-3">
              {!videoSrc && (
                <DropZone accept="video/*" onFile={handleVideoFile}
                  icon={<Film className="w-4 h-4" />}
                  title="Drop video here" subtitle="MP4, WebM, MOV…" filename={videoName} />
              )}
              {cues.length === 0 && (
                <DropZone accept=".srt,.txt" onFile={handleSrtFile}
                  icon={<FileText className="w-4 h-4" />}
                  title="Drop .srt here" subtitle="SubRip subtitle file" filename={srtName} />
              )}
            </div>
          )}

          {/* Video player */}
          <VideoPlayer
            videoSrc={videoSrc}
            cues={cues}
            style={subtitleStyle}
            onTimeUpdate={handleTimeUpdate}
            activeCueId={activeCueId}
            showControls={showControls}
            loop={loop}
            muted={muted}
          />

          {/* ── Playback toggles row ─────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            <ToggleChip
              checked={showControls}
              onChange={setShowControls}
              icon={showControls ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              label="Show Controls"
            />
            <ToggleChip
              checked={loop}
              onChange={setLoop}
              icon={<Repeat className="w-3.5 h-3.5" />}
              label="Loop"
            />
            <ToggleChip
              checked={!muted}
              onChange={(v) => setMuted(!v)}
              icon={!muted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              label="Sound"
            />

            {/* Replace links on the right */}
            {videoSrc && cues.length > 0 && (
              <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground/50">
                <label className="flex items-center gap-1.5 hover:text-muted-foreground cursor-pointer transition-colors group">
                  <Upload className="w-3 h-3 group-hover:text-primary transition-colors" />
                  Replace video
                  <input type="file" accept="video/*" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = '' }} />
                </label>
                <span>·</span>
                <label className="flex items-center gap-1.5 hover:text-muted-foreground cursor-pointer transition-colors group">
                  <Upload className="w-3 h-3 group-hover:text-primary transition-colors" />
                  Replace .srt
                  <input type="file" accept=".srt,.txt" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSrtFile(f); e.target.value = '' }} />
                </label>
                {cues.length > 0 && (
                  <span className="text-muted-foreground/40 font-mono">{cues.length} cues</span>
                )}
              </div>
            )}
          </div>

          {/* ── Editor panels (tabs) ─────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border">
              {EDITOR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all border-b-2',
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-amber-dim/30'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-raised/50'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === 'style' && (
                <SubtitleStylePanel style={subtitleStyle} onChange={setSubtitleStyle} />
              )}
              {activeTab === 'timing' && (
                <SubtitleTimingEditor
                  cues={cues}
                  currentTime={currentTime}
                  activeCueId={activeCueId}
                  onChange={setCues}
                  onCueClick={(id) => setActiveCueId(id)}
                />
              )}
              {activeTab === 'export' && (
                <ExportPanel
                  cues={cues}
                  style={subtitleStyle}
                  videoBlob={videoBlob}
                  videoName={videoName}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end pb-2">
            <span className="text-xs text-muted-foreground/30 font-mono">powered by @tscaps/engine</span>
          </div>
        </div>
      </main>
    </div>
  )
}
