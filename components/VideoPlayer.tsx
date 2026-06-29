'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Film } from 'lucide-react'
import { SubtitleCue, SubtitleStyle } from '@/lib/srt'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoSrc: string | null
  cues: SubtitleCue[]
  style: SubtitleStyle
  onTimeUpdate?: (time: number) => void
  activeCueId?: number | null
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || isNaN(sec)) return '00:00'
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
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDraggingRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)

  // Find currently active cue
  const activeCue = cues.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  )

  // --- Controls auto-hide ---
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500)
  }, [])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  // --- Video event listeners ---
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate_prop(video.currentTime)
    }
    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setCurrentTime(0)
    }
    const onDurationChange = () => {
      if (isFinite(video.duration)) setDuration(video.duration)
    }
    const onPlay = () => {
      setPlaying(true)
      scheduleHide()
    }
    const onPause = () => {
      setPlaying(false)
      revealControls()
    }
    const onEnded = () => {
      setPlaying(false)
      revealControls()
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleHide, revealControls])

  // Keep a stable ref to the onTimeUpdate prop
  const onTimeUpdateRef = useRef(onTimeUpdate)
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate }, [onTimeUpdate])
  const onTimeUpdate_prop = useCallback((t: number) => onTimeUpdateRef.current?.(t), [])

  // Seek to active cue when clicked in the timing editor
  useEffect(() => {
    if (activeCueId != null && videoRef.current) {
      const cue = cues.find((c) => c.id === activeCueId)
      if (cue) videoRef.current.currentTime = cue.startTime
    }
  }, [activeCueId, cues])

  // --- Playback controls ---
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  // --- Seekbar scrubbing ---
  const seekToRatio = useCallback((clientX: number) => {
    const bar = progressBarRef.current
    const video = videoRef.current
    if (!bar || !video || !isFinite(video.duration) || video.duration === 0) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
    setCurrentTime(video.currentTime)
  }, [])

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDraggingRef.current = true
    seekToRatio(e.clientX)

    const onMouseMove = (ev: MouseEvent) => {
      if (isDraggingRef.current) seekToRatio(ev.clientX)
    }
    const onMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // --- Subtitle text style ---
  const subtitleTextStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize * 0.6}px`,
    color: style.color,
    fontWeight: style.bold ? 800 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    WebkitTextStroke:
      style.strokeWidth > 0
        ? `${(style.strokeWidth / 100).toFixed(3)}em ${style.strokeColor}`
        : undefined,
    paintOrder: 'stroke fill' as React.CSSProperties['paintOrder'],
    textShadow: style.shadow ? '0 2px 8px rgba(0,0,0,0.8)' : undefined,
    lineHeight: 1.25,
    textAlign: 'center',
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={() => {
        revealControls()
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
          <span style={subtitleTextStyle} className="max-w-[90%] px-3 py-1 rounded">
            {activeCue.text.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </span>
        </div>
      )}

      {/* Controls overlay */}
      {videoSrc && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 transition-opacity duration-300',
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-3 pt-8">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/bar hover:h-2.5 transition-all duration-100"
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="h-full bg-primary rounded-full relative pointer-events-none"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full -mr-1.5 shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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

                <button
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted
                    ? <VolumeX className="w-4 h-4" />
                    : <Volume2 className="w-4 h-4" />
                  }
                </button>

                <span className="text-white/60 text-xs tabular-nums font-mono select-none">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Fullscreen"
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
