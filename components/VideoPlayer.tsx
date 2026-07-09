'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, Maximize2, Film } from 'lucide-react'
import { SubtitleCue, SubtitleStyle } from '@/lib/srt'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoSrc: string | null
  cues?: SubtitleCue[] | null
  style: SubtitleStyle
  onTimeUpdate?: (time: number) => void
  activeCueId?: number | null
  showControls?: boolean
  loop?: boolean
  muted?: boolean
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || isNaN(sec) || sec < 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity / 100})`
}

export default function VideoPlayer({
  videoSrc,
  cues = [],
  style,
  onTimeUpdate,
  activeCueId,
  showControls = true,
  loop = false,
  muted = false,
}: VideoPlayerProps) {
  const videoRef        = useRef<HTMLVideoElement>(null)
  const containerRef    = useRef<HTMLDivElement>(null)
  const progressBarRef  = useRef<HTMLDivElement>(null)
  const isDraggingRef   = useRef(false)
  const hideTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep callbacks fresh without re-registering event listeners
  const onTimeUpdateRef = useRef(onTimeUpdate)
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate }, [onTimeUpdate])

  const [playing, setPlaying]       = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]     = useState(0)
  const [overlayVisible, setOverlayVisible] = useState(true)

  // ── Sync muted / loop props → DOM element ──────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
  }, [muted])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.loop = loop
  }, [loop])

  // ── Active cue: derived from currentTime every render ──────────
  const activeCue = cues?.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  ) ?? null

  // ── Controls auto-hide ─────────────────────────────────────────
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), 2500)
  }, [])

  const revealOverlay = useCallback(() => {
    setOverlayVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  // ── Register all video events once ─────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdateEvt = () => {
      const t = video.currentTime
      setCurrentTime(t)
      onTimeUpdateRef.current?.(t)
    }
    const onMeta = () => {
      if (isFinite(video.duration)) setDuration(video.duration)
      setCurrentTime(video.currentTime)
    }
    const onDurationChange = () => {
      if (isFinite(video.duration)) setDuration(video.duration)
    }
    const onPlay  = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => { setPlaying(false); setOverlayVisible(true) }

    video.addEventListener('timeupdate',     onTimeUpdateEvt)
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('play',           onPlay)
    video.addEventListener('pause',          onPause)
    video.addEventListener('ended',          onEnded)

    return () => {
      video.removeEventListener('timeupdate',     onTimeUpdateEvt)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('play',           onPlay)
      video.removeEventListener('pause',          onPause)
      video.removeEventListener('ended',          onEnded)
    }
  // Empty deps: all callbacks accessed via refs or stable setters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── React to src changes — must call load() for metadata ───────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    if (videoSrc) {
      video.src = videoSrc
      video.muted = muted
      video.loop = loop
      video.load()
    }
  // Only re-run when videoSrc changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc])

  // ── Jump to cue when timing editor clicks one ──────────────────
  useEffect(() => {
    if (activeCueId == null) return
    const cue = cues.find((c) => c.id === activeCueId)
    if (cue && videoRef.current) videoRef.current.currentTime = cue.startTime
  }, [activeCueId, cues])

  // ── Playback toggle ────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return
    if (video.paused || video.ended) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [videoSrc])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }, [])

  // ── Seekbar — pointer capture for reliable drag across devices ─
  const seekToClientX = useCallback((clientX: number) => {
    const bar   = progressBarRef.current
    const video = videoRef.current
    if (!bar || !video || !isFinite(video.duration) || video.duration === 0) return
    const rect  = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
    setCurrentTime(video.currentTime)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDraggingRef.current = true
    progressBarRef.current?.setPointerCapture(e.pointerId)
    seekToClientX(e.clientX)
  }, [seekToClientX])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    seekToClientX(e.clientX)
  }, [seekToClientX])

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  // ── Subtitle positioning from style.placement ──────────────────
  const placementStyle = (): React.CSSProperties => {
    switch (style.placement) {
      case 'top':    return { top: '12px', bottom: 'auto' }
      case 'center': return { top: '50%', transform: 'translateY(-50%)', bottom: 'auto' }
      case 'bottom':
      default:       return { bottom: showControls ? '68px' : '12px', top: 'auto' }
    }
  }

  // ── Subtitle text styles ───────────────────────────────────────
  const subtitleFontSize = Math.max(12, style.fontSize * 3)    // px, min 12
  const subtitleTextStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${subtitleFontSize}px`,
    color: style.color,
    fontWeight: style.bold ? 800 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    textShadow: style.shadow
      ? '0 1px 4px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.6)'
      : undefined,
    WebkitTextStroke: style.strokeWidth > 0
      ? `${(style.strokeWidth / 100).toFixed(3)}em ${style.strokeColor}`
      : undefined,
    paintOrder: 'stroke fill' as React.CSSProperties['paintOrder'],
    lineHeight: 1.3,
    textAlign: 'center',
  }

  const backdropBg = style.backdropEnabled
    ? hexToRgba(style.backdropColor, style.backdropOpacity)
    : undefined

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={() => { revealOverlay(); if (playing) scheduleHide() }}
      onMouseLeave={() => { if (playing) scheduleHide() }}
    >
      {/* Empty state */}
      {!videoSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border border-border">
            <Film className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No video loaded</p>
        </div>
      )}

      {/* Video element — src is managed imperatively via useEffect + .load() */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {/* Subtitle overlay */}
      {activeCue && videoSrc && (
        <div
          className="absolute left-0 right-0 flex justify-center px-4 pointer-events-none"
          style={{ ...placementStyle(), zIndex: 10 }}
          aria-live="polite"
        >
          {style.backdropEnabled ? (
            <div className="flex flex-col items-center gap-0.5">
              {activeCue.text.split('\n').map((line, i) => (
                <span
                  key={i}
                  style={{
                    ...subtitleTextStyle,
                    backgroundColor: backdropBg,
                    padding: '0.12em 0.45em',
                    borderRadius: '0.18em',
                    display: 'inline-block',
                  }}
                >
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <div style={subtitleTextStyle}>
              {activeCue.text.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-video overlay controls */}
      {videoSrc && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 transition-opacity duration-300',
            showControls && overlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{ zIndex: 20 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-3 pt-8">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3 relative touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none"
                style={{ left: `${progress}%` }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-primary transition-colors"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing
                    ? <Pause className="w-5 h-5 fill-current" />
                    : <Play  className="w-5 h-5 fill-current" />
                  }
                </button>
                <span className="text-white/70 text-xs tabular-nums font-mono">
                  {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
                </span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
