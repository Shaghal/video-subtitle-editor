'use client'

import { useState } from 'react'
import { SubtitleStyle } from '@/lib/srt'
import {
  Bold, Italic, Sun, Download, Check, Pipette,
  AlignVerticalDistributeCenter, AlignStartVertical, AlignEndVertical,
  ChevronsUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubtitleStylePanelProps {
  style: SubtitleStyle
  onChange: (s: SubtitleStyle) => void
}

const FONT_OPTIONS = [
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Arial',     value: 'Arial, sans-serif' },
  { label: 'Georgia',   value: 'Georgia, serif' },
  { label: 'Impact',    value: 'Impact, fantasy' },
  { label: 'Courier',   value: '"Courier New", monospace' },
  { label: 'Verdana',   value: 'Verdana, sans-serif' },
]

const TEXT_COLORS   = ['#ffffff', '#ffd400', '#ff4d4d', '#4dffa6', '#4db8ff', '#ff4dff', '#ff8800', '#000000']
const STROKE_COLORS = ['#000000', '#1a1a2e', '#ffffff', '#ff4d4d', '#4db8ff', '#ffd400']
const BACKDROP_COLORS = ['#000000', '#1a1a2e', '#ffffff', '#1e3a5f', '#3d0000', '#1a3a1a']

/** Loads a Google Font and returns the CSS font-family string */
function loadGoogleFont(family: string): string {
  const id = `gfont-${family.replace(/\s+/g, '-').toLowerCase()}`
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const link = document.createElement('link')
    link.id   = id
    link.rel  = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`
    document.head.appendChild(link)
  }
  return `'${family}', sans-serif`
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </span>
  )
}

function Divider() {
  return <div className="h-px bg-border" />
}

/** A row of color swatches + a native color-picker trigger icon */
function ColorRow({
  colors,
  value,
  onChange,
}: {
  colors: string[]
  value: string
  onChange: (c: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c}
          className={cn(
            'w-5 h-5 rounded-full border-2 transition-all hover:scale-110 shrink-0',
            value === c ? 'border-white scale-110' : 'border-transparent',
            (c === '#ffffff' || c === '#ffd400') && 'ring-1 ring-border/60'
          )}
          style={{ backgroundColor: c }}
          aria-label={`Color ${c}`}
        />
      ))}
      {/* Icon-based custom picker */}
      <label
        className="relative w-6 h-6 flex items-center justify-center rounded-lg border border-border bg-surface hover:border-primary/50 cursor-pointer transition-colors shrink-0"
        title="Custom color"
      >
        <Pipette className="w-3 h-3 text-muted-foreground pointer-events-none" />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
      {/* Show current value swatch */}
      <div
        className="w-5 h-5 rounded-full border border-border/60 shrink-0"
        style={{ backgroundColor: value }}
        title={value}
      />
    </div>
  )
}

export default function SubtitleStylePanel({ style, onChange }: SubtitleStylePanelProps) {
  const set = <K extends keyof SubtitleStyle>(key: K, val: SubtitleStyle[K]) =>
    onChange({ ...style, [key]: val })

  const [importInput, setImportInput] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [customFonts, setCustomFonts] = useState<{ label: string; value: string }[]>([])

  const handleImportFont = () => {
    const name = importInput.trim()
    if (!name) return
    setImportLoading(true)
    const fontValue = loadGoogleFont(name)
    setTimeout(() => {
      const entry = { label: name, value: fontValue }
      setCustomFonts((prev) => prev.some((f) => f.value === fontValue) ? prev : [...prev, entry])
      set('fontFamily', fontValue)
      setImportInput('')
      setImportLoading(false)
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 2000)
    }, 600)
  }

  const allFonts = [...FONT_OPTIONS, ...customFonts]

  // Preview backdrop
  const hex = style.backdropColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16) || 0
  const g = parseInt(hex.slice(2, 4), 16) || 0
  const b = parseInt(hex.slice(4, 6), 16) || 0
  const backdropPreviewBg = `rgba(${r},${g},${b},${style.backdropOpacity / 100})`

  return (
    <div className="flex flex-col gap-4">

      {/* ── Font Family ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Font Family</Label>
        <div className="grid grid-cols-3 gap-1">
          {allFonts.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('fontFamily', opt.value)}
              className={cn(
                'text-[11px] px-2 py-1.5 rounded-md border transition-all text-left truncate',
                style.fontFamily === opt.value
                  ? 'border-primary bg-amber-dim text-primary font-semibold'
                  : 'border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-surface-raised'
              )}
              style={{ fontFamily: opt.value }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Import */}
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Google Font name…"
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImportFont()}
            className="flex-1 text-[11px] bg-surface border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
          />
          <button
            onClick={handleImportFont}
            disabled={!importInput.trim() || importLoading}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-all shrink-0',
              importSuccess
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {importSuccess
              ? <><Check className="w-3 h-3" />Loaded</>
              : <><Download className="w-3 h-3" />{importLoading ? '…' : 'Import'}</>}
          </button>
        </div>
      </div>

      <Divider />

      {/* ── Size + Style on same row ─────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Size &amp; Style</Label>
          <span className="text-[11px] font-mono text-primary">{style.fontSize} px</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Size slider — takes most of the row */}
          <input
            type="range" min={3} max={14} step={0.5}
            value={style.fontSize}
            onChange={(e) => set('fontSize', parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1 rounded-full cursor-pointer"
          />
          {/* Style toggles inline */}
          <div className="flex items-center gap-1 shrink-0">
            {([
              { key: 'bold'   as const, icon: <Bold   className="w-3.5 h-3.5" />, label: 'Bold'   },
              { key: 'italic' as const, icon: <Italic className="w-3.5 h-3.5" />, label: 'Italic' },
              { key: 'shadow' as const, icon: <Sun    className="w-3.5 h-3.5" />, label: 'Shadow' },
            ] as const).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => set(key, !style[key])}
                aria-pressed={!!style[key]}
                title={label}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-md border transition-all',
                  style[key]
                    ? 'border-primary bg-amber-dim text-primary'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Text Color ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Label>Text</Label>
        <div className="flex-1">
          <ColorRow colors={TEXT_COLORS} value={style.color} onChange={(c) => set('color', c)} />
        </div>
      </div>

      {/* ── Stroke row ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Label>Outline</Label>
          <div className="flex-1">
            <ColorRow colors={STROKE_COLORS} value={style.strokeColor} onChange={(c) => set('strokeColor', c)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-10 shrink-0">Width</span>
          <input
            type="range" min={0} max={15} step={1}
            value={style.strokeWidth}
            onChange={(e) => set('strokeWidth', parseInt(e.target.value))}
            className="flex-1 accent-primary h-1 rounded-full cursor-pointer"
          />
          <span className="text-[11px] font-mono text-primary w-10 text-right shrink-0">
            {(style.strokeWidth / 100).toFixed(2)}em
          </span>
        </div>
      </div>

      <Divider />

      {/* ── Backdrop row ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Label>Backdrop</Label>
          {/* Toggle switch inline */}
          <button
            onClick={() => set('backdropEnabled', !style.backdropEnabled)}
            aria-pressed={style.backdropEnabled}
            className={cn(
              'relative inline-flex h-4.5 w-8 items-center rounded-full border transition-colors shrink-0',
              style.backdropEnabled ? 'bg-primary border-primary' : 'bg-surface border-border'
            )}
            style={{ height: '18px', width: '32px' }}
          >
            <span className={cn(
              'inline-block h-3 w-3 rounded-full bg-white shadow transition-transform',
              style.backdropEnabled ? 'translate-x-[16px]' : 'translate-x-[2px]'
            )} />
            <span className="sr-only">Toggle backdrop</span>
          </button>
          <div className={cn('flex-1 transition-opacity', !style.backdropEnabled && 'opacity-30 pointer-events-none')}>
            <ColorRow colors={BACKDROP_COLORS} value={style.backdropColor} onChange={(c) => set('backdropColor', c)} />
          </div>
        </div>
        {/* Opacity row */}
        <div className={cn('flex items-center gap-3 transition-opacity', !style.backdropEnabled && 'opacity-30 pointer-events-none')}>
          <span className="text-[11px] text-muted-foreground w-10 shrink-0">Opacity</span>
          <input
            type="range" min={10} max={100} step={5}
            value={style.backdropOpacity}
            onChange={(e) => set('backdropOpacity', parseInt(e.target.value))}
            className="flex-1 accent-primary h-1 rounded-full cursor-pointer"
          />
          <span className="text-[11px] font-mono text-primary w-10 text-right shrink-0">
            {style.backdropOpacity}%
          </span>
        </div>
      </div>

      <Divider />

      {/* ── Placement ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Placement</Label>
        <div className="flex items-center gap-1.5">
          {([
            { val: 'top'    as const, icon: <AlignStartVertical            className="w-3.5 h-3.5" />, label: 'Top'    },
            { val: 'center' as const, icon: <AlignVerticalDistributeCenter className="w-3.5 h-3.5" />, label: 'Center' },
            { val: 'bottom' as const, icon: <AlignEndVertical              className="w-3.5 h-3.5" />, label: 'Bottom' },
          ] as const).map(({ val, icon, label }) => (
            <button
              key={val}
              onClick={() => set('placement', val)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-[11px] font-medium transition-all',
                style.placement === val
                  ? 'border-primary bg-amber-dim text-primary'
                  : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised'
              )}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Live preview ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Preview</Label>
        <div className="bg-black rounded-lg py-5 flex items-center justify-center">
          <span
            style={{
              fontFamily: style.fontFamily,
              fontSize: `${Math.max(16, style.fontSize * 3)}px`,
              color: style.color,
              fontWeight: style.bold ? 800 : 400,
              fontStyle: style.italic ? 'italic' : 'normal',
              WebkitTextStroke: style.strokeWidth > 0
                ? `${(style.strokeWidth / 100).toFixed(3)}em ${style.strokeColor}`
                : undefined,
              paintOrder: 'stroke fill' as React.CSSProperties['paintOrder'],
              textShadow: style.shadow ? '0 2px 8px rgba(0,0,0,0.8)' : undefined,
              ...(style.backdropEnabled
                ? { backgroundColor: backdropPreviewBg, padding: '0.12em 0.45em', borderRadius: '0.18em' }
                : {}),
            }}
          >
            Sample subtitle text
          </span>
        </div>
      </div>
    </div>
  )
}
