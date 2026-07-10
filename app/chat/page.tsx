'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Palette, Clock, PackageOpen, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubtitleCue, SubtitleStyle, DEFAULT_STYLE, parseSrt } from '@/lib/srt'
import VideoPlayer from '@/components/VideoPlayer'
import SubtitleStylePanel from '@/components/SubtitleStylePanel'
import SubtitleTimingEditor from '@/components/SubtitleTimingEditor'
import ExportPanel from '@/components/ExportPanel'

type ChatMode = 'welcome' | 'style' | 'timing' | 'export'

const CHAT_OPTIONS = [
  {
    id: 'style',
    title: 'Customize Style',
    description: 'Fonts, colors, backdrop, placement',
    icon: Palette,
  },
  {
    id: 'timing',
    title: 'Adjust Timing',
    description: 'Edit subtitle sync',
    icon: Clock,
  },
  {
    id: 'export',
    title: 'Export & Download',
    description: 'Download SRT or hardsub video',
    icon: PackageOpen,
  },
]

export default function ChatEditor() {
  const [isDark, setIsDark] = useState(true)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [srtFile, setSrtFile] = useState<File | null>(null)
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [chatMode, setChatMode] = useState<ChatMode>('welcome')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Theme toggle
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
    document.documentElement.classList.add('light')
    setIsDark(false)
  }, [])

  const handleVideoFile = useCallback((file: File) => {
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
  }, [])

  const handleSrtFile = useCallback((file: File) => {
    setSrtFile(file)
    file.text().then((content) => {
      const parsed = parseSrt(content)
      setCues(parsed)
    })
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'srt') => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      if (type === 'video') handleVideoFile(file)
      else handleSrtFile(file)
    }
  }

  const isReady = videoSrc && cues.length > 0

  return (
    <div className={cn(
      'min-h-screen',
      isDark ? 'dark bg-background' : 'light bg-[#f5f3f0]'
    )}>
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsDark((d) => !d)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-black/5 text-gray-600 hover:text-gray-900 transition-all hover:shadow-md"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-black/5 bg-white/40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#d4a5a5]" />
              <h1 className="text-lg font-semibold text-gray-900">SubCraft Chat</h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Video section */}
          <div className="flex-1 flex flex-col">
            {isReady ? (
              <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-black/5">
                <VideoPlayer
                  videoSrc={videoSrc}
                  cues={cues}
                  style={style}
                  showControls={true}
                  muted={false}
                />
              </div>
            ) : (
              <div className="flex-1 bg-gradient-to-br from-[#f5f3f0] to-[#ede9e4] rounded-xl border-2 border-dashed border-black/10 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Upload video and subtitles to start</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat section */}
          <div className="w-96 flex flex-col bg-white/50 backdrop-blur rounded-xl border border-black/5 overflow-hidden shadow-sm">
            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Welcome or file upload */}
              {!isReady && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 tracking-wider">SUBCRAFṬ</div>
                    <p className="text-gray-900 font-medium">Upload your files to get started</p>
                  </div>

                  {/* File upload zones */}
                  <div className="space-y-3">
                    <label className="block">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileSelect(e, 'video')}
                        className="hidden"
                      />
                      <div className="bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all border border-green-200/50">
                        <div className="text-sm font-medium text-green-900">{videoFile?.name || 'Select Video'}</div>
                        <div className="text-xs text-green-700/70">Video file (.mp4, .webm, etc.)</div>
                      </div>
                    </label>

                    <label className="block">
                      <input
                        type="file"
                        accept=".srt"
                        onChange={(e) => handleFileSelect(e, 'srt')}
                        className="hidden"
                      />
                      <div className="bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all border border-purple-200/50">
                        <div className="text-sm font-medium text-purple-900">{srtFile?.name || 'Select Subtitles'}</div>
                        <div className="text-xs text-purple-700/70">SubRip file (.srt)</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* After files uploaded */}
              {isReady && (
                <div className="space-y-6">
                  {/* AI message */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500 tracking-wider">SUBCRAFṬ</div>
                    <p className="text-gray-900">What would you like to do with your subtitles?</p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    {CHAT_OPTIONS.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <button
                          key={option.id}
                          onClick={() => setChatMode(option.id as ChatMode)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg transition-all border',
                            'hover:shadow-sm active:scale-95',
                            option.id === 'style' && 'bg-gradient-to-r from-[#f0e6ff] to-[#e6d9ff] border-purple-200/50 hover:border-purple-300/75',
                            option.id === 'timing' && 'bg-gradient-to-r from-[#e0f7fa] to-[#b2ebf2] border-cyan-200/50 hover:border-cyan-300/75',
                            option.id === 'export' && 'bg-gradient-to-r from-[#ffe0e6] to-[#ffc9d0] border-pink-200/50 hover:border-pink-300/75'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm text-gray-900">{option.title}</div>
                              <div className="text-xs text-gray-600">{option.description}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Inline editing component */}
                  {chatMode !== 'welcome' && (
                    <div className="pt-4 border-t border-black/5">
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-gray-500 tracking-wider">YOU</div>
                        
                        {/* Style editor */}
                        {chatMode === 'style' && (
                          <div className="bg-gradient-to-br from-[#f9f7f4] to-[#f5f3f0] rounded-lg p-4 border border-black/5">
                            <SubtitleStylePanel
                              cues={cues}
                              style={style}
                              onStyleChange={setStyle}
                            />
                          </div>
                        )}

                        {/* Timing editor */}
                        {chatMode === 'timing' && (
                          <div className="bg-gradient-to-br from-[#f9f7f4] to-[#f5f3f0] rounded-lg p-4 border border-black/5 max-h-96 overflow-y-auto">
                            <SubtitleTimingEditor
                              cues={cues}
                              onCuesChange={setCues}
                            />
                          </div>
                        )}

                        {/* Export panel */}
                        {chatMode === 'export' && (
                          <div className="bg-gradient-to-br from-[#f9f7f4] to-[#f5f3f0] rounded-lg p-4 border border-black/5">
                            <ExportPanel
                              cues={cues}
                              style={style}
                              videoSrc={videoSrc || ''}
                              videoFile={videoFile}
                            />
                          </div>
                        )}

                        {/* Back button */}
                        <button
                          onClick={() => setChatMode('welcome')}
                          className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-black/10 rounded-lg transition-colors hover:bg-black/5"
                        >
                          ← Back to options
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
