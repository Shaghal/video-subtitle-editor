'use client'

import { SubtitleStyle } from '@/lib/srt'
import { Bold, Italic, Sun, SquareDashed } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubtitleStylePanelProps {
  style: SubtitleStyle
  onChange: (s: SubtitleStyle) => void
}

const FONT_OPTIONS = [
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Impact', value: 'Impact, fantasy' },
  { label: 'Courier', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
]

const PRESET_COLORS = [
  '#ffffff', '#ffd400', '#ff4d4d',
  '#4dffa6', '#4db8ff', '#ff4dff',
  '#ff8800', '#00e5ff',
]

const STROKE_COLORS = ['#000000', '#1a1a2e', '#ffffff', '#ff4d4d', '#4db8ff']

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

export default function SubtitleStylePanel({ style, onChange }: SubtitleStylePanelProps) {
  const set = <K extends keyof SubtitleStyle>(key: K, value: SubtitleStyle[K]) =>
    onChange({ ...style, [key]: value })

  return (
    <div className="flex flex-col gap-5">
      {/* Font Family */}
      <div className="flex flex-col gap-2">
        <Label>Font Family</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {FONT_OPTIONS.map((opt) => (
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
      </div>

      <SectionDivider />

      {/* Font Size */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Font Size</Label>
          <span className="text-xs font-mono text-primary">{style.fontSize} cqh</span>
        </div>
        <input
          type="range"
          min={3}
          max={14}
          step={0.5}
          value={style.fontSize}
          onChange={(e) => set('fontSize', parseFloat(e.target.value))}
          className="w-full accent-primary h-1 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Small</span>
          <span>Large</span>
        </div>
      </div>

      <SectionDivider />

      {/* Style toggles */}
      <div className="flex flex-col gap-2">
        <Label>Style</Label>
        <div className="flex gap-2">
          <button
            onClick={() => set('bold', !style.bold)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              style.bold
                ? 'border-primary bg-amber-dim text-primary'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised'
            )}
            aria-pressed={style.bold}
          >
            <Bold className="w-3.5 h-3.5" />
            Bold
          </button>
          <button
            onClick={() => set('italic', !style.italic)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              style.italic
                ? 'border-primary bg-amber-dim text-primary'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised'
            )}
            aria-pressed={style.italic}
          >
            <Italic className="w-3.5 h-3.5" />
            Italic
          </button>
          <button
            onClick={() => set('shadow', !style.shadow)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              style.shadow
                ? 'border-primary bg-amber-dim text-primary'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised'
            )}
            aria-pressed={style.shadow}
          >
            <Sun className="w-3.5 h-3.5" />
            Shadow
          </button>
        </div>
      </div>

      <SectionDivider />

      {/* Text Color */}
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
            <input
              type="color"
              value={style.color}
              onChange={(e) => set('color', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: style.color }}
            />
          </label>
        </div>
      </div>

      <SectionDivider />

      {/* Stroke */}
      <div className="flex flex-col gap-3">
        <Label>Outline / Stroke</Label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Width</span>
            <span className="text-xs font-mono text-primary">{(style.strokeWidth / 100).toFixed(2)}em</span>
          </div>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={style.strokeWidth}
            onChange={(e) => set('strokeWidth', parseInt(e.target.value))}
            className="w-full accent-primary h-1 rounded-full cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Color</span>
          <div className="flex items-center gap-2 flex-wrap">
            {STROKE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set('strokeColor', c)}
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
              <input
                type="color"
                value={style.strokeColor}
                onChange={(e) => set('strokeColor', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: style.strokeColor }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <SectionDivider />
      <div className="flex flex-col gap-2">
        <Label>Preview</Label>
        <div className="bg-black rounded-lg py-6 px-4 flex items-center justify-center">
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
            }}
          >
            Sample subtitle text
          </span>
        </div>
      </div>
    </div>
  )
}
