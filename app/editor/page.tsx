'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Film, FileText, Subtitles, Palette, Clock, PackageOpen, Eye, EyeOff, Repeat, Volume2, VolumeX, Sun, Moon } from 'lucide-react'
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
  filename?: string
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.match(accept)
    )
    if (file) onFile(file)
  }

  return (
    <button
      onClick={(e) => {
        const input = e.currentTarget.querySelector('input[type=file]') as HTMLInputElement
        input?.click()
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative w-full h-40 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer',
        isDragOver
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface hover:bg-surface-raised'
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="hidden"
      />
      <div className="text-primary">{icon}</div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  )
}

export default function Editor() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }, [isDark])

  // Initialize dark class on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Playback control toggles
  const [showControls, setShowControls] = useState(true)
  const [loop, setLoop] = useState(false)
  const [muted, setMuted] = useState(false)

  // Video & subtitle state
  const [videoSrc, setVideoSrc] = useState<string>('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [activeTab, setActiveTab] = useState<EditorTab>('style')

  const handleVideoFile = (file: File) => {
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
  }

  const handleSrtFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseSrt(text)
      setCues(parsed)
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Subtitles className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg tracking-tight">SubCraft</h1>
              <p className="text-xs text-muted-foreground">Subtitle Editor</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File upload section */}
        <div className="mb-12 grid grid-cols-2 gap-6">
          <DropZone
            accept="video/*"
            onFile={handleVideoFile}
            icon={<Film className="w-8 h-8" />}
            title="Add Video"
            subtitle="MP4, WebM, MOV…"
            filename={videoFile?.name}
          />
          <DropZone
            accept=".srt"
            onFile={handleSrtFile}
            icon={<FileText className="w-8 h-8" />}
            title="Add .srt"
            subtitle="SubRip subtitle file"
          />
        </div>

        {/* Video player + toggles section */}
        <div className="mb-12">
          <VideoPlayer
            videoSrc={videoSrc}
            cues={cues}
            style={style}
            showControls={showControls}
            loop={loop}
            muted={muted}
          />

          {/* Control toggles under video */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-raised transition-colors">
              <input
                type="checkbox"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">Show Controls</span>
            </label>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-raised transition-colors">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">Loop</span>
            </label>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-raised transition-colors">
              <input
                type="checkbox"
                checked={!muted}
                onChange={(e) => setMuted(!e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">Sound</span>
            </label>
          </div>
        </div>

        {/* Editor panels */}
        <div className="border border-border rounded-xl bg-card">
          {/* Tabs */}
          <div className="border-b border-border flex gap-1 p-1 bg-surface rounded-t-xl">
            {EDITOR_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-raised'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="p-6">
            {activeTab === 'style' && (
              <SubtitleStylePanel style={style} onStyleChange={setStyle} />
            )}
            {activeTab === 'timing' && (
              <SubtitleTimingEditor cues={cues} onCuesChange={setCues} videoSrc={videoSrc} />
            )}
            {activeTab === 'export' && (
              <ExportPanel cues={cues} style={style} videoSrc={videoSrc} videoFile={videoFile} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
