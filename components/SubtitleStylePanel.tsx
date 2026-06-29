'use client'

import { useState, useRef } from 'react'
import { SubtitleStyle } from '@/lib/srt'
import { Bold, Italic, Sun, Download, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubtitleStylePanelProps {
  style: SubtitleStyle
  onChange: (s: SubtitleStyle) => void
}

const FONT_OPTIONS = [
  { label: 'System UI',  value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Arial',      value: 'Arial, sans-serif' },
  { label: 'Georgia',    value: 'Georgia, serif' },
  { label: 'Impact',     value: 'Impact, fantasy' },
  { label: 'Courier',    value: '"Courier New", monospace' },
  { label: 'Verdana',    value: 'Verdana, sans-serif' },
]

const PRESET_COLORS = [
  '#ffffff', '#ffd400', '#ff4d4d',
  '#4dffa6', '#4db8ff', '#ff4dff',
  '#ff8800', '#00e5ff',
]

const STROKE_COLORS = ['#000000', '#1a1a2e', '#ffffff', '#ff4d4d', '#4db8ff']

const BACKDROP_PRESETS = [
  '#000000', '#1a1a2e', '#ffffff', '#1e3a5f', '#3d0000',
]

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </span>
  )
}

function SectionDivider() {
  return <div className="h-px bg-border w-full" />
}

/** Dynamically loads a Google Font given a family name */
function loadGoogleFont(family: string): string {
  const id = `gfont-${family.replace(/\s+/g, '-').toLowerCase()}`
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`
    document.head.appendChild(link)
  }
  // Return a proper CSS font-family value
  return `'${family}', sans-serif`
}

export default function SubtitleStylePanel({ style, onChange }: SubtitleStylePanelProps) {
  const set = <K extends keyof SubtitleStyle>(key: K, value: SubtitleStyle[K]) =>
    onChange({ ...style, [key]: value })

  const [importInput, setImportInput] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Custom fonts imported this session
  const [customFonts, setCustomFonts] = useState<{ label: string; value: string }[]>([])

  const handleImportFont = () => {
    const name = importInput.trim()
    if (!name) return
    setImportLoading(true)
    const fontValue = loadGoogleFont(name)
    // Wait a tick for CSS to begin loading, then apply
    setTimeout(() => {
      const entry = { label: name, value: fontValue }
      setCustomFonts((prev) => {
        if (prev.some((f) => f.value === fontValue)) return prev
        return [...prev, entry]
      })
      set('fontFamily', fontValue)
      setImportInput('')
      setImportLoading(false)
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 2000)
    }, 600)
  }

  const allFonts = [...FONT_OPTIONS, ...customFonts]

  return (
    <div className="flex flex-col gap-5">

      {/* ── Font Family ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Font Family</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {allFonts.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('fontFamily', opt.value)}
              className={cn(
                'text-xs px-3 py-2 rounded-lg border transition-all text-left truncate',
                style.fontFamily === opt.value
                  ? 'border-primary bg-amber-dim text-primary font-semibold'
                  : 'border-border bg-surface text-muted-foreground hover:border-border hover:text-foreground hover:bg-surface-raised'
              )}
              style={{ fontFamily: opt.value }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Import Google Font */}
        <div className="flex gap-2 mt-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Google Font name, e.g. Roboto"
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImportFont()}
            className="flex-1 text-xs bg-surface border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
          />
          <button
            onClick={handleImportFont}
            disabled={!importInput.trim() || importLoading}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all shrink-0',
              importSuccess
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {importSuccess
              ? <><Check className="w-3.5 h-3.5" />Loaded</>
              : <><Download className="w-3.5 h-3.5" />{importLoading ? 'Loading…' : 'Import'}</>
            }
          </button>
        </div>
        <p className="text-xs text-muted-foreground/50">
          Type any Google Fonts name and press Import.
        </p>
      </div>

      <SectionDivider />

      {/* ── Font Size ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Font Size</Label>
          <span className="text-xs font-mono text-primary">{style.fontSize} cqh</span>
        </div>
        <input
          type="range" min={3} max={14} step={0.5}
          value={style.fontSize}
          onChange={(e) => set('fontSize', parseFloat(e.target.value))}
          className="w-full accent-primary h-1 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Small</span><span>Large</span>
        </div>
      </div>

      <SectionDivider />

      {/* ── Style toggles ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Style</Label>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'bold'   as const, icon: <Bold   className="w-3.5 h-3.5" />, label: 'Bold'   },
            { key: 'italic' as const, icon: <Italic className="w-3.5 h-3.5" />, label: 'Italic' },
            { key: 'shadow' as const, icon: <Sun    className="w-3.5 h-3.5" />, label: 'Shadow' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => set(key, !style[key])}
              aria-pressed={!!style[key]}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                style[key]
                  ? 'border-primary bg-amber-dim text-primary'
                  : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised'
              )}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Text Color ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Text Color</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => set('color', c)}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                style.color === c ? 'border-white scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
          <label className="relative w-7 h-7 rounded-full overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors" title="Custom color">
            <input type="color" value={style.color} onChange={(e) => set('color', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="w-full h-full rounded-full" style={{ backgroundColor: style.color }} />
          </label>
        </div>
      </div>

      <SectionDivider />

      {/* ── Stroke ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Label>Outline / Stroke</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Width</span>
            <span className="text-xs font-mono text-primary">{(style.strokeWidth / 100).toFixed(2)}em</span>
          </div>
          <input type="range" min={0} max={15} step={1} value={style.strokeWidth}
            onChange={(e) => set('strokeWidth', parseInt(e.target.value))}
            className="w-full accent-primary h-1 rounded-full cursor-pointer" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Color</span>
          <div className="flex items-center gap-2 flex-wrap">
            {STROKE_COLORS.map((c) => (
              <button key={c} onClick={() => set('strokeColor', c)}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                  style.strokeColor === c ? 'border-white scale-110' : 'border-transparent',
                  c === '#ffffff' && 'ring-1 ring-border'
                )}
                style={{ backgroundColor: c }}
                aria-label={`Stroke color ${c}`}
              />
            ))}
            <label className="relative w-7 h-7 rounded-full overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors" title="Custom stroke color">
              <input type="color" value={style.strokeColor} onChange={(e) => set('strokeColor', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-full h-full rounded-full" style={{ backgroundColor: style.strokeColor }} />
            </label>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Backdrop</Label>
          {/* Toggle enable */}
          <button
            onClick={() => set('backdropEnabled', !style.backdropEnabled)}
            aria-pressed={style.backdropEnabled}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full border transition-colors',
              style.backdropEnabled
                ? 'bg-primary border-primary'
                : 'bg-surface border-border'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                style.backdropEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
              )}
            />
            <span className="sr-only">Toggle backdrop</span>
          </button>
        </div>

        <div className={cn('flex flex-col gap-3 transition-opacity', !style.backdropEnabled && 'opacity-40 pointer-events-none')}>
          {/* Color */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Color</span>
            <div className="flex items-center gap-2 flex-wrap">
              {BACKDROP_PRESETS.map((c) => (
                <button key={c} onClick={() => set('backdropColor', c)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                    style.backdropColor === c ? 'border-white scale-110' : 'border-transparent',
                    c === '#ffffff' && 'ring-1 ring-border'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Backdrop color ${c}`}
                />
              ))}
              <label className="relative w-7 h-7 rounded-full overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors" title="Custom backdrop color">
                <input type="color" value={style.backdropColor} onChange={(e) => set('backdropColor', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-full h-full rounded-full" style={{ backgroundColor: style.backdropColor }} />
              </label>
            </div>
          </div>

          {/* Opacity */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Opacity</span>
              <span className="text-xs font-mono text-primary">{style.backdropOpacity}%</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={style.backdropOpacity}
              onChange={(e) => set('backdropOpacity', parseInt(e.target.value))}
              className="w-full accent-primary h-1 rounded-full cursor-pointer" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Transparent</span><span>Opaque</span>
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Live preview ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Preview</Label>
        <div className="bg-black rounded-lg py-6 px-4 flex items-center justify-center">
          {(() => {
            const hex = style.backdropColor.replace('#', '')
            const r = parseInt(hex.slice(0, 2), 16)
            const g = parseInt(hex.slice(2, 4), 16)
            const b = parseInt(hex.slice(4, 6), 16)
            const a = style.backdropOpacity / 100
            return (
              <span
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: '22px',
                  color: style.color,
                  fontWeight: style.bold ? 800 : 400,
                  fontStyle: style.italic ? 'italic' : 'normal',
                  WebkitTextStroke: style.strokeWidth > 0
                    ? `${(style.strokeWidth / 100).toFixed(3)}em ${style.strokeColor}`
                    : undefined,
                  paintOrder: 'stroke fill' as React.CSSProperties['paintOrder'],
                  textShadow: style.shadow ? '0 2px 8px rgba(0,0,0,0.8)' : undefined,
                  lineHeight: 1.25,
                  textAlign: 'center',
                  ...(style.backdropEnabled
                    ? { backgroundColor: `rgba(${r},${g},${b},${a})`, padding: '0.15em 0.5em', borderRadius: '0.2em' }
                    : {}),
                }}
              >
                Sample subtitle text
              </span>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
