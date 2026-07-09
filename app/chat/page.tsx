'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Film, FileText, Send, X, Palette, Clock, PackageOpen, ArrowRight, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubtitleCue, SubtitleStyle, DEFAULT_STYLE, parseSrt } from '@/lib/srt'
import VideoPlayer from '@/components/VideoPlayer'
import SubtitleStylePanel from '@/components/SubtitleStylePanel'
import SubtitleTimingEditor from '@/components/SubtitleTimingEditor'
import ExportPanel from '@/components/ExportPanel'

type ChatMode = 'welcome' | 'style' | 'timing' | 'export' | 'done'

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

const CHAT_OPTIONS = [
  {
    id: 'style',
    title: 'Customize Style',
    description: 'Adjust fonts, colors, backdrop, and placement',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    id: 'timing',
    title: 'Adjust Timing',
    description: 'Edit subtitle timing and synchronization',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: 'export',
    title: 'Export & Download',
    description: 'Download SRT or render hardsub video',
    icon: <PackageOpen className="w-5 h-5" />,
  },
]

function DropZone({
  accept,
  onFile,
  icon,
  title,
  subtitle,
}: {
  accept: string
  onFile: (file: File) => void
  icon: React.ReactNode
  title: string
  subtitle: string
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
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.match(accept))
    if (file) onFile(file)
  }
  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all',
        isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface-overlay/30 hover:border-primary/50'
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="hidden"
      />
      {icon}
      <div className="text-center text-sm">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </label>
  )
}

export default function ChatEditorPage() {
  const [videoSrc, setVideoSrc] = useState<string>('')
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoName, setVideoName] = useState<string | null>(null)
  const [srtFile, setSrtFile] = useState<string>('')
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [showControls, setShowControls] = useState(true)
  const [loop, setLoop] = useState(false)
  const [muted, setMuted] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const [mode, setMode] = useState<ChatMode>('welcome')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (role: 'assistant' | 'user', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36),
        role,
        content,
        timestamp: new Date(),
      },
    ])
  }

  const handleVideoFile = (file: File) => {
    setVideoName(file.name)
    setVideoBlob(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setVideoSrc(src)
      addMessage('assistant', `Video uploaded: ${file.name}. Now, would you like to upload a subtitle file (.srt)?`)
    }
    reader.readAsDataURL(file)
  }

  const handleSrtFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setSrtFile(text)
      try {
        const parsed = parseSrt(text)
        setCues(parsed)
        addMessage('assistant', `Subtitles loaded: ${parsed.length} cues found. What would you like to do?`)
        setMode('welcome')
      } catch (err) {
        addMessage('assistant', 'Failed to parse subtitle file. Please check the format.')
      }
    }
    reader.readAsText(file)
  }

  const handleOptionClick = (optionId: string) => {
    if (optionId === 'style') {
      addMessage('user', 'Customize Style')
      addMessage('assistant', 'Great! Let\'s customize the subtitle appearance.')
      setMode('style')
    } else if (optionId === 'timing') {
      addMessage('user', 'Adjust Timing')
      addMessage('assistant', 'Perfect! Let\'s adjust the subtitle timing.')
      setMode('timing')
    } else if (optionId === 'export') {
      addMessage('user', 'Export & Download')
      addMessage('assistant', 'Ready to export! Choose how you\'d like to download.')
      setMode('export')
    }
  }

  const handleBack = () => {
    addMessage('assistant', 'What would you like to do next?')
    setMode('welcome')
  }

  const isReady = videoSrc && cues.length > 0

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">SubCraft Chat</h1>
        </div>
        <button
          onClick={() => setIsDark((d) => !d)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground transition-all"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main content - Split: Video + Chat */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* Left: Video Player */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="rounded-lg border border-border bg-surface overflow-hidden flex-1">
            {videoSrc ? (
              <VideoPlayer
                videoSrc={videoSrc}
                subtitles={cues}
                style={style}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                showControls={showControls}
                loop={loop}
                muted={muted}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-overlay">
                <div className="text-center">
                  <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No video loaded yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Control toggles */}
          <div className="flex gap-2 flex-wrap">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-overlay/50 text-sm cursor-pointer hover:border-primary/40 transition-all">
              <input
                type="checkbox"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
                className="w-4 h-4"
              />
              Show Controls
            </label>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-overlay/50 text-sm cursor-pointer hover:border-primary/40 transition-all">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="w-4 h-4"
              />
              Loop
            </label>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-overlay/50 text-sm cursor-pointer hover:border-primary/40 transition-all">
              <input
                type="checkbox"
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
                className="w-4 h-4"
              />
              Sound
            </label>
          </div>
        </div>

        {/* Right: Chat Interface */}
        <div className="w-96 flex flex-col border border-border rounded-lg bg-surface-overlay overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                <p>Upload a video and subtitle file to get started</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-xs text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface text-foreground border border-border'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat content area */}
          <div className="border-t border-border p-4 space-y-3 max-h-96 overflow-y-auto">
            {!isReady ? (
              <div className="space-y-2">
                <DropZone
                  accept="video/*"
                  onFile={handleVideoFile}
                  icon={<Film className="w-6 h-6 text-muted-foreground" />}
                  title="Video"
                  subtitle="Drag or click to upload"
                />
                <DropZone
                  accept=".srt,.vtt"
                  onFile={handleSrtFile}
                  icon={<FileText className="w-6 h-6 text-muted-foreground" />}
                  title="Subtitles (.srt)"
                  subtitle="Drag or click to upload"
                />
              </div>
            ) : mode === 'welcome' ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">What would you like to do?</p>
                {CHAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-border bg-surface hover:border-primary/40 hover:bg-surface-raised transition-all"
                  >
                    <div className="text-primary mt-0.5">{opt.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{opt.title}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : mode === 'style' ? (
              <div className="space-y-3">
                <button
                  onClick={handleBack}
                  className="w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  ← Back
                </button>
                <SubtitleStylePanel style={style} onChange={setStyle} />
              </div>
            ) : mode === 'timing' ? (
              <div className="space-y-3">
                <button
                  onClick={handleBack}
                  className="w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  ← Back
                </button>
                <SubtitleTimingEditor
                  cues={cues}
                  currentTime={currentTime}
                  onChange={setCues}
                  onCueClick={(id) => {
                    const cue = cues.find((c) => c.index === id)
                    if (cue) {
                      // Jump to cue start time
                      setCurrentTime(cue.startTime)
                    }
                  }}
                />
              </div>
            ) : mode === 'export' ? (
              <div className="space-y-3">
                <button
                  onClick={handleBack}
                  className="w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  ← Back
                </button>
                <ExportPanel cues={cues} style={style} videoBlob={videoBlob} videoName={videoName} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
