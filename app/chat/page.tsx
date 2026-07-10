'use client'

import { useState } from 'react'
import { SubtitleCue, SubtitleStyle, DEFAULT_STYLE } from '@/lib/srt'
import VideoPlayer from '@/components/VideoPlayer'
import SubtitleStylePanel from '@/components/SubtitleStylePanel'
import SubtitleTimingEditor from '@/components/SubtitleTimingEditor'
import ExportPanel from '@/components/ExportPanel'
import { parseSrt } from '@/lib/srt'
import { Moon, Sun, Settings } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'assistant' | 'user'
  content: string
  step?: 'main' | 'style' | 'timing' | 'export'
}

// Granular style options extracted from SubtitleStylePanel
const STYLE_OPTIONS = [
  { id: 'font', label: 'Font', description: 'Family & size' },
  { id: 'color', label: 'Color', description: 'Text color' },
  { id: 'stroke', label: 'Outline', description: 'Border style' },
  { id: 'backdrop', label: 'Backdrop', description: 'Background' },
  { id: 'placement', label: 'Placement', description: 'Position' },
]

// Granular timing options from SubtitleTimingEditor
const TIMING_OPTIONS = [
  { id: 'sync', label: 'Sync', description: 'Adjust timing' },
  { id: 'edit', label: 'Edit', description: 'Text content' },
  { id: 'add', label: 'Add', description: 'New subtitle' },
]

// Export options from ExportPanel
const EXPORT_OPTIONS = [
  { id: 'srt', label: 'Download', description: '.srt file' },
  { id: 'hardsub', label: 'Burn', description: 'Into video' },
]

export default function ChatEditorPage() {
  const [isDark, setIsDark] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Upload your video and subtitles to start editing.',
    },
  ])
  const [activeStep, setActiveStep] = useState<'main' | 'style' | 'timing' | 'export' | null>(null)
  const [activeOption, setActiveOption] = useState<string | null>(null)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      addMessage('assistant', 'Video loaded! Now add your subtitles.', 'main')
    }
  }

  const handleSrtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result as string
          const parsed = parseSrt(content)
          setCues(parsed)
          addMessage('assistant', 'Subtitles loaded! What would you like to adjust?', 'main')
          setActiveStep('main')
        } catch (err) {
          addMessage('assistant', 'Error parsing subtitles. Check format.', 'main')
        }
      }
      reader.readAsText(file)
    }
  }

  const addMessage = (type: 'assistant' | 'user', content: string, step?: ChatMessage['step']) => {
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, type, content, step }])
  }

  const handleSelectStep = (step: 'style' | 'timing' | 'export') => {
    setActiveStep(step)
    setActiveOption(null)
    const label = step === 'style' ? 'Font' : step === 'timing' ? 'Timing' : 'Export'
    addMessage('user', `Adjust ${label}`)
    addMessage('assistant', `Choose what to ${step === 'style' ? 'customize' : 'adjust'}.`)
  }

  const handleSelectOption = (optionId: string) => {
    setActiveOption(optionId)
    addMessage('user', optionId)
  }

  const handleBackToMain = () => {
    setActiveStep('main')
    setActiveOption(null)
    addMessage('assistant', 'What would you like to adjust?')
  }

  return (
    <div className={isDark ? 'dark' : 'light'}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-lg font-semibold">SubCraft</h1>
            <div className="flex items-center gap-3">
              <a href="/editor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pro Mode
              </a>
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-surface-overlay transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video section */}
            <div className="lg:col-span-2 space-y-4">
              {videoSrc && videoFile ? (
                <VideoPlayer
                  videoSrc={videoSrc}
                  cues={cues}
                  style={style}
                  showControls={true}
                  loop={false}
                  muted={false}
                />
              ) : (
                <div className="aspect-video bg-surface-overlay rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <label className="cursor-pointer text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <div className="space-y-2">
                      <Settings className="w-12 h-12 mx-auto text-primary/50" />
                      <p className="text-sm text-muted-foreground">Upload video</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Chat section */}
            <div className="space-y-4">
              {/* Chat messages */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg text-sm ${
                      msg.type === 'assistant'
                        ? 'bg-primary/10 text-foreground'
                        : 'bg-secondary/20 text-foreground ml-8 text-right'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>

              {/* Upload zone for subtitles */}
              {!cues.length && (
                <label className="block p-3 bg-surface-overlay rounded-lg border-2 border-dashed border-primary/20 cursor-pointer hover:border-primary/50 transition-colors text-center text-sm">
                  <input
                    type="file"
                    accept=".srt"
                    onChange={handleSrtUpload}
                    className="hidden"
                  />
                  <p className="text-muted-foreground">Upload .srt</p>
                </label>
              )}

              {/* Main options */}
              {activeStep === 'main' && cues.length > 0 && (
                <div className="space-y-2">
                  {[
                    { id: 'style', label: 'Customize Style', color: 'from-pink-200 to-purple-200' },
                    { id: 'timing', label: 'Adjust Timing', color: 'from-blue-200 to-cyan-200' },
                    { id: 'export', label: 'Export', color: 'from-rose-200 to-orange-200' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectStep(opt.id as 'style' | 'timing' | 'export')}
                      className={`w-full p-2 rounded-lg bg-gradient-to-r ${opt.color} text-foreground text-sm font-medium hover:shadow-md transition-shadow`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Style options */}
              {activeStep === 'style' && !activeOption && (
                <div className="space-y-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className="w-full p-2 text-left rounded-lg bg-surface-overlay hover:bg-surface-raised transition-colors text-sm"
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.description}</div>
                    </button>
                  ))}
                  <button onClick={handleBackToMain} className="w-full p-2 text-sm text-muted-foreground hover:text-foreground">
                    ← Back
                  </button>
                </div>
              )}

              {/* Timing options */}
              {activeStep === 'timing' && !activeOption && (
                <div className="space-y-2">
                  {TIMING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className="w-full p-2 text-left rounded-lg bg-surface-overlay hover:bg-surface-raised transition-colors text-sm"
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.description}</div>
                    </button>
                  ))}
                  <button onClick={handleBackToMain} className="w-full p-2 text-sm text-muted-foreground hover:text-foreground">
                    ← Back
                  </button>
                </div>
              )}

              {/* Export options */}
              {activeStep === 'export' && !activeOption && (
                <div className="space-y-2">
                  {EXPORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className="w-full p-2 text-left rounded-lg bg-surface-overlay hover:bg-surface-raised transition-colors text-sm"
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.description}</div>
                    </button>
                  ))}
                  <button onClick={handleBackToMain} className="w-full p-2 text-sm text-muted-foreground hover:text-foreground">
                    ← Back
                  </button>
                </div>
              )}

              {/* Render selected component */}
              {activeOption === 'font' && (
                <div className="space-y-2 p-3 bg-surface-overlay rounded-lg">
                  <SubtitleStylePanel style={style} onChange={setStyle} />
                  <button onClick={handleBackToMain} className="w-full p-2 text-sm text-muted-foreground hover:text-foreground">
                    Done
                  </button>
                </div>
              )}

              {activeOption === 'sync' && (
                <div className="space-y-2 p-3 bg-surface-overlay rounded-lg max-h-64 overflow-y-auto">
                  <SubtitleTimingEditor cues={cues} currentTime={0} onChange={setCues} />
                  <button onClick={handleBackToMain} className="w-full p-2 text-sm text-muted-foreground hover:text-foreground">
                    Done
                  </button>
                </div>
              )}

              {activeOption === 'srt' && (
                <div className="space-y-2 p-3 bg-surface-overlay rounded-lg">
                  <ExportPanel cues={cues} style={style} videoBlob={videoFile} videoName={videoFile?.name || null} />
                  <button onClick={handleBackToMain} className="w-full p-2 text-sm text-muted-foreground hover:text-foreground">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
