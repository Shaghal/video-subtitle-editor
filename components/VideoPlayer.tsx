'use client'

import { useRef, useEffect, useState } from 'react'
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

  // Keep a live ref to the callback so event listeners never go stale
  const onTimeUpdateRef = useRef(onTimeUpdate)
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate }, [onTimeUpdate])

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [overlayVisible, setOverlayVisible] = useState(true)

  // Sync muted prop → video element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
  }, [muted])

  // Sync loop prop → video element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.loop = loop
  }, [loop])

  // Active subtitle cue derived from current time
  const activeCue = cues.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  ) ?? null

  // ── Auto-hide overlay controls ──────────────────────────────────
  function scheduleHide() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), 2500)
  }
  function revealOverlay() {
    setOverlayVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  // ── Attach all video event listeners once on mount ──────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleTimeUpdate() {
      setCurrentTime(video!.currentTime)
      onTimeUpdateRef.current?.(video!.currentTime)
    }
    function handleLoadedMetadata() {
      setDuration(video!.duration)
      setCurrentTime(0)
      // Sync props that may have been set before src loaded
      video!.muted = muted
      video!.loop = loop
    }
    function handleDurationChange() {
      if (isFinite(video!.duration)) setDuration(video!.duration)
    }
    function handlePlay() { setPlaying(true) }
    function handlePause() { setPlaying(false) }
    function handleEnded() { setPlaying(false) }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when video source changes
  useEffect(() => {
    if (!videoSrc) return
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [videoSrc])

  // Seek to cue when timing editor clicks a cue
  useEffect(() => {
    if (activeCueId == null) return
    const cue = cues.find((c) => c.id === activeCueId)
    if (cue && videoRef.current) {
      videoRef.current.currentTime = cue.startTime
    }
  }, [activeCueId, cues])

  // ── Playback ────────────────────────────────────────────────────
  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  // ── Seekbar ─────────────────────────────────────────────────────
  function seekToClientX(clientX: number) {
    const bar = progressBarRef.current
    const video = videoRef.current
    if (!bar || !video || !isFinite(video.duration) || video.duration === 0) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
    setCurrentTime(video.currentTime)
  }

  function handleProgressMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    isDraggingRef.current = true
    seekToClientX(e.clientX)

    function onMove(ev: MouseEvent) {
      if (isDraggingRef.current) seekToClientX(ev.clientX)
    }
    function onUp() {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Subtitle CSS ────────────────────────────────────────────────
  const subtitleStyle: React.CSSProperties = {
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
    display: 'inline-block',
    maxWidth: '90%',
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  // Whether the in-video overlay controls should render at all
  const overlayShown = showControls && overlayVisible

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={() => {
        revealOverlay()
        if (playing) scheduleHide()
      }}
      onMouseLeave={() => {
        if (playing) scheduleHide()
      }}
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
          className="absolute bottom-14 left-0 right-0 flex justify-center px-6 pointer-events-none"
          aria-live="polite"
        >
          <span style={subtitleStyle}>
            {activeCue.text.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </span>
        </div>
      )}

      {/* In-video overlay: progress + play/fullscreen */}
      {videoSrc && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 transition-opacity duration-300',
            overlayShown ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-3 pt-10">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3 relative"
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="h-full bg-primary rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg pointer-events-none -ml-1.5 transition-opacity"
                style={{ left: `${progress}%` }}
              />
            </div>

            {/* Button row */}
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
                    : <Play className="w-5 h-5 fill-current" />
                  }
                </button>

                {/* Timer */}
                <span className="text-white/70 text-xs tabular-nums font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
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
