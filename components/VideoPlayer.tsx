'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, Maximize2, Film } from 'lucide-react'
import { SubtitleCue, SubtitleStyle } from '@/lib/srt'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoSrc: string | null
  cues: SubtitleCue[]
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

export default function VideoPlayer({
  videoSrc,
  cues,
  style,
  onTimeUpdate,
  activeCueId,
  showControls = true,
  loop = false,
  muted = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Always-fresh ref to the callback — never stale inside event listeners
  const onTimeUpdateRef = useRef(onTimeUpdate)
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate }, [onTimeUpdate])

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [overlayVisible, setOverlayVisible] = useState(true)

  // ── Sync controlled props to the DOM element every time they change ──
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    if (videoRef.current) videoRef.current.loop = loop
  }, [loop])

  // ── Active cue derived each render from currentTime ──────────────
  const activeCue = cues.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  ) ?? null

  // ── Auto-hide overlay ─────────────────────────────────────────────
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), 2500)
  }, [])

  const revealOverlay = useCallback(() => {
    setOverlayVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  // ── All video event listeners in one stable useEffect ────────────
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
      // Re-apply controlled props after a new src loads
      video.muted = muted
      video.loop = loop
    }
    const onDurationChange = () => {
      if (isFinite(video.duration)) setDuration(video.duration)
    }
    const onPlay  = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — we use refs for callbacks

  // Reset state when src changes
  useEffect(() => {
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [videoSrc])

  // Seek when timing editor clicks a cue
  useEffect(() => {
    if (activeCueId == null) return
    const cue = cues.find((c) => c.id === activeCueId)
    if (cue && videoRef.current) videoRef.current.currentTime = cue.startTime
  }, [activeCueId, cues])

  // ── Playback toggle ───────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }, [])

  // ── Seekbar — pointer-capture approach for reliable drag ─────────
  const seekToClientX = useCallback((clientX: number) => {
    const bar = progressBarRef.current
    const video = videoRef.current
    if (!bar || !video || !isFinite(video.duration) || video.duration === 0) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
    setCurrentTime(video.currentTime)
  }, [])

  const handleProgressPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const bar = progressBarRef.current
    if (!bar) return
    bar.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    seekToClientX(e.clientX)
  }, [seekToClientX])

  const handleProgressPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    seekToClientX(e.clientX)
  }, [seekToClientX])

  const handleProgressPointerUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  // ── Subtitle styles ───────────────────────────────────────────────
  const subtitleTextStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize * 3}px`,
    color: style.color,
    fontWeight: style.bold ? 800 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    textShadow: style.shadow
      ? '0 1px 4px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.6)'
      : undefined,
    WebkitTextStroke:
      style.strokeWidth > 0
        ? `${(style.strokeWidth / 100).toFixed(3)}em ${style.strokeColor}`
        : undefined,
    paintOrder: 'stroke fill' as React.CSSProperties['paintOrder'],
    lineHeight: 1.3,
    textAlign: 'center',
  }

  // Convert hex + opacity to rgba for backdrop
  const backdropStyle: React.CSSProperties | undefined = style.backdropEnabled
    ? (() => {
        const hex = style.backdropColor.replace('#', '')
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        const a = style.backdropOpacity / 100
        return {
          backgroundColor: `rgba(${r},${g},${b},${a})`,
          padding: '0.15em 0.5em',
          borderRadius: '0.2em',
          display: 'inline-block',
        }
      })()
    : undefined

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const overlayShown = showControls && overlayVisible

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

      {/* Video element */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          playsInline
        />
      )}

      {/* Subtitle overlay */}
      {activeCue && videoSrc && (
        <div
          className="absolute left-0 right-0 flex justify-center px-4 pointer-events-none"
          style={{ bottom: showControls ? '72px' : '16px' }}
          aria-live="polite"
        >
          {style.backdropEnabled ? (
            // Each line gets its own backdrop pill
            <div className="flex flex-col items-center gap-1">
              {activeCue.text.split('\n').map((line, i) => (
                <span key={i} style={{ ...subtitleTextStyle, ...backdropStyle }}>
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <span style={subtitleTextStyle}>
              {activeCue.text.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </span>
          )}
        </div>
      )}

      {/* In-video overlay controls */}
      {videoSrc && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 transition-opacity duration-300',
            overlayShown ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-3 pt-8">
            {/* Progress bar — pointer-capture for reliable drag */}
            <div
              ref={progressBarRef}
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3 relative touch-none"
              onPointerDown={handleProgressPointerDown}
              onPointerMove={handleProgressPointerMove}
              onPointerUp={handleProgressPointerUp}
            >
              {/* Filled track */}
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              {/* Scrub thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none"
                style={{ left: `${progress}%` }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play / Pause */}
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
                {/* Timer */}
                <span className="text-white/70 text-xs tabular-nums font-mono">
                  {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
                </span>
              </div>
              {/* Fullscreen */}
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
