'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Palette, Clock, PackageOpen, Sun, Moon, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubtitleCue, SubtitleStyle, DEFAULT_STYLE, parseSrt } from '@/lib/srt'
import VideoPlayer from '@/components/VideoPlayer'
import SubtitleStylePanel from '@/components/SubtitleStylePanel'
import SubtitleTimingEditor from '@/components/SubtitleTimingEditor'
import ExportPanel from '@/components/ExportPanel'
import Link from 'next/link'

type ChatStep = 'welcome' | 'main' | 'style' | 'timing' | 'export' | 'style-detail'

interface MessageBubble {
  id: string
  type: 'assistant' | 'user'
  content: React.ReactNode
  step: ChatStep
}

export default function ChatEditor() {
  const [isDark, setIsDark] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [srtFile, setSrtFile] = useState<File | null>(null)
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [style, setStyle] = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [chatStep, setChatStep] = useState<ChatStep>('welcome')
  const [messages, setMessages] = useState<MessageBubble[]>([])
  const [selectedStyleMenu, setSelectedStyleMenu] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

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

  const handleShowMainMenu = () => {
    if (messages.length === 0 || messages[messages.length - 1].step !== 'main') {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          type: 'assistant',
          content: 'What would you like to adjust?',
          step: 'main',
        },
      ])
    }
    setChatStep('main')
  }

  const handleSelectOption = (option: 'style' | 'timing' | 'export') => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        content: option === 'style' ? 'Customize Style' : option === 'timing' ? 'Adjust Timing' : 'Export & Download',
        step: option,
      },
    ])
    setChatStep(option)
  }

  const handleBackToMenu = () => {
    setChatStep('main')
    setSelectedStyleMenu(null)
  }

  const isReady = videoSrc && cues.length > 0

  return (
    <div className={cn('min-h-screen', isDark ? 'dark bg-background' : 'light bg-[#faf8f6]')}>
      {/* Mode toggle buttons */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link
          href="/editor"
          className="px-3 py-2 rounded-lg text-sm font-medium bg-white/60 backdrop-blur border border-black/10 text-gray-700 hover:bg-white/80 transition-all"
        >
          Pro Mode
        </Link>
        <button
          onClick={() => setIsDark((d) => !d)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur border border-black/10 text-gray-600 hover:bg-white/80 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-black/8 bg-white/40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4b5d0]" />
              <h1 className="text-base font-semibold text-gray-800">SubCraft</h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Video section */}
          <div className="flex-1 flex flex-col">
            {isReady ? (
              <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-black/8">
                <VideoPlayer
                  videoSrc={videoSrc}
                  cues={cues}
                  style={style}
                  showControls={true}
                  muted={false}
                />
              </div>
            ) : (
              <div className="flex-1 bg-gradient-to-br from-[#f5e6ff] via-[#faf8f6] to-[#e6f3ff] rounded-2xl border-2 border-dashed border-black/15 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-14 h-14 text-purple-300 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium text-lg">Upload video and subtitles to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat section */}
          <div className="w-96 flex flex-col bg-white/60 backdrop-blur rounded-2xl border border-black/8 overflow-hidden shadow-sm">
            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Welcome/Upload state */}
              {!isReady && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 tracking-wide">SUBCRAFṬ</div>
                    <div className="bg-gradient-to-br from-[#f9f7f5] to-[#faf8f6] rounded-xl p-4 border border-black/8">
                      <p className="text-gray-800 font-medium text-sm leading-relaxed">Let's get started! Please upload your video and subtitle file.</p>
                    </div>
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
                      <div className="bg-gradient-to-br from-[#ffe6f0] to-[#ffd9e8] rounded-lg p-4 cursor-pointer hover:shadow-md transition-all border border-rose-200/60 hover:border-rose-300/80">
                        <div className="text-sm font-semibold text-rose-900">{videoFile?.name || 'Select Video'}</div>
                        <div className="text-xs text-rose-800/70 mt-1">MP4, WebM, or other video format</div>
                      </div>
                    </label>

                    <label className="block">
                      <input
                        type="file"
                        accept=".srt"
                        onChange={(e) => handleFileSelect(e, 'srt')}
                        className="hidden"
                      />
                      <div className="bg-gradient-to-br from-[#e6e6ff] to-[#f0e6ff] rounded-lg p-4 cursor-pointer hover:shadow-md transition-all border border-purple-200/60 hover:border-purple-300/80">
                        <div className="text-sm font-semibold text-purple-900">{srtFile?.name || 'Select Subtitles'}</div>
                        <div className="text-xs text-purple-800/70 mt-1">SubRip format (.srt)</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* After files uploaded */}
              {isReady && (
                <div className="space-y-5">
                  {/* First message - ask what to adjust */}
                  {(chatStep === 'welcome' || messages.length === 0) && (
                    <>
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-500 tracking-wide">SUBCRAFṬ</div>
                        <div className="bg-gradient-to-br from-[#f9f7f5] to-[#faf8f6] rounded-xl p-4 border border-black/8">
                          <p className="text-gray-800 font-medium text-sm leading-relaxed">What would you like to adjust in your subtitles?</p>
                        </div>
                      </div>

                      {/* Main menu options */}
                      <div className="space-y-2.5">
                        <button
                          onClick={() => {
                            handleSelectOption('style')
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: `msg-${Date.now()}`,
                                type: 'assistant',
                                content: 'Great! What aspect of styling would you like to customize?',
                                step: 'style-detail',
                              },
                            ])
                            setChatStep('style-detail')
                          }}
                          className="w-full text-left p-3.5 rounded-lg transition-all border border-purple-200/60 bg-gradient-to-br from-[#f5e6ff] to-[#ede6ff] hover:border-purple-300/80 hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm text-purple-900">Customize Style</div>
                              <div className="text-xs text-purple-800/70 mt-0.5">Fonts, colors, backdrop, placement</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            handleSelectOption('timing')
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: `msg-${Date.now()}`,
                                type: 'assistant',
                                content: 'Perfect! Let\'s sync your subtitles to the video.',
                                step: 'timing',
                              },
                            ])
                            setChatStep('timing')
                          }}
                          className="w-full text-left p-3.5 rounded-lg transition-all border border-cyan-200/60 bg-gradient-to-br from-[#e6f7ff] to-[#dff0ff] hover:border-cyan-300/80 hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm text-cyan-900">Adjust Timing</div>
                              <div className="text-xs text-cyan-800/70 mt-0.5">Sync subtitles with the video</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            handleSelectOption('export')
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: `msg-${Date.now()}`,
                                type: 'assistant',
                                content: 'Ready to export! Choose how you\'d like to save your work.',
                                step: 'export',
                              },
                            ])
                            setChatStep('export')
                          }}
                          className="w-full text-left p-3.5 rounded-lg transition-all border border-rose-200/60 bg-gradient-to-br from-[#ffe6f0] to-[#ffd9e8] hover:border-rose-300/80 hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm text-rose-900">Export & Download</div>
                              <div className="text-xs text-rose-800/70 mt-0.5">Save SRT or burn into video</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Render messages from history */}
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500 tracking-wide">
                        {msg.type === 'assistant' ? 'SUBCRAFṬ' : 'YOU'}
                      </div>
                      <div
                        className={cn(
                          'rounded-xl p-4 border',
                          msg.type === 'assistant'
                            ? 'bg-gradient-to-br from-[#f9f7f5] to-[#faf8f6] border-black/8'
                            : 'bg-gradient-to-br from-[#f0f8ff] to-[#e6f2ff] border-blue-200/40'
                        )}
                      >
                        {msg.type === 'assistant' ? (
                          <p className="text-gray-800 font-medium text-sm leading-relaxed">{msg.content}</p>
                        ) : (
                          <p className="text-gray-800 font-medium text-sm">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Inline editing components */}
                  {chatStep === 'style-detail' && (
                    <div className="space-y-3 pt-2 border-t border-black/8">
                      <div className="text-xs font-semibold text-gray-500 tracking-wide">YOU</div>
                      <div className="bg-gradient-to-br from-[#faf8f6] to-[#f5f3f0] rounded-xl p-4 border border-black/8 max-h-72 overflow-y-auto">
                        <SubtitleStylePanel
                          style={style}
                          onChange={setStyle}
                        />
                      </div>
                      <button
                        onClick={handleBackToMenu}
                        className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-black/10 rounded-lg transition-colors hover:bg-black/5 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to menu
                      </button>
                    </div>
                  )}

                  {chatStep === 'timing' && (
                    <div className="space-y-3 pt-2 border-t border-black/8">
                      <div className="text-xs font-semibold text-gray-500 tracking-wide">YOU</div>
                      <div className="bg-gradient-to-br from-[#faf8f6] to-[#f5f3f0] rounded-xl p-4 border border-black/8 max-h-72 overflow-y-auto">
                        <SubtitleTimingEditor
                          cues={cues}
                          currentTime={0}
                          onChange={setCues}
                        />
                      </div>
                      <button
                        onClick={handleBackToMenu}
                        className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-black/10 rounded-lg transition-colors hover:bg-black/5 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to menu
                      </button>
                    </div>
                  )}

                  {chatStep === 'export' && (
                    <div className="space-y-3 pt-2 border-t border-black/8">
                      <div className="text-xs font-semibold text-gray-500 tracking-wide">YOU</div>
                      <div className="bg-gradient-to-br from-[#faf8f6] to-[#f5f3f0] rounded-xl p-4 border border-black/8 max-h-72 overflow-y-auto">
                        <ExportPanel
                          cues={cues}
                          style={style}
                          videoBlob={videoFile || null}
                          videoName={videoFile?.name || null}
                        />
                      </div>
                      <button
                        onClick={handleBackToMenu}
                        className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-black/10 rounded-lg transition-colors hover:bg-black/5 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to menu
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
