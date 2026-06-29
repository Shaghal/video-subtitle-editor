'use client'

import { useState, useRef } from 'react'
import { SubtitleCue, formatTimestamp, parseTimestamp } from '@/lib/srt'
import { Pencil, Trash2, Plus, Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubtitleTimingEditorProps {
  cues: SubtitleCue[]
  currentTime: number
  activeCueId?: number | null
  onChange: (cues: SubtitleCue[]) => void
  onCueClick?: (id: number) => void
}

function TimeInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setRaw(formatTimestamp(value))
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  const commit = () => {
    try {
      const parsed = parseTimestamp(raw)
      if (!isNaN(parsed) && parsed >= 0) onChange(parsed)
    } catch {
      // ignore invalid input
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="font-mono text-xs bg-surface-overlay border border-primary/50 rounded px-1.5 py-0.5 text-primary outline-none w-28 text-center"
        placeholder="00:00:00,000"
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-surface-overlay group"
      title="Click to edit"
    >
      {formatTimestamp(value)}
    </button>
  )
}

function CueRow({
  cue,
  isActive,
  isPlaying,
  onChange,
  onDelete,
  onClick,
}: {
  cue: SubtitleCue
  isActive: boolean
  isPlaying: boolean
  onChange: (updated: SubtitleCue) => void
  onDelete: () => void
  onClick: () => void
}) {
  const [editingText, setEditingText] = useState(false)
  const [draft, setDraft] = useState(cue.text)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const startTextEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(cue.text)
    setEditingText(true)
    setTimeout(() => textRef.current?.focus(), 10)
  }

  const commitText = () => {
    onChange({ ...cue, text: draft.trim() || cue.text })
    setEditingText(false)
  }

  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all cursor-pointer',
        isActive
          ? 'border-primary bg-amber-dim'
          : isPlaying
          ? 'border-border/60 bg-surface-raised'
          : 'border-border bg-surface hover:border-border/80 hover:bg-surface-raised'
      )}
      onClick={onClick}
    >
      {isPlaying && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-lg" />
      )}

      <div className="px-3 py-2.5 flex items-start gap-3">
        {/* Index */}
        <span className={cn(
          'text-xs font-mono w-5 text-center mt-0.5 shrink-0',
          isActive ? 'text-primary' : 'text-muted-foreground/50'
        )}>
          {cue.id}
        </span>

        {/* Times */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <TimeInput
              value={cue.startTime}
              onChange={(v) => onChange({ ...cue, startTime: v })}
            />
          </div>
          <div className="flex items-center gap-1.5 pl-4">
            <span className="text-muted-foreground/40 text-xs">↓</span>
            <TimeInput
              value={cue.endTime}
              onChange={(v) => onChange({ ...cue, endTime: v })}
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          {editingText ? (
            <div className="flex flex-col gap-1.5">
              <textarea
                ref={textRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                className="w-full text-sm bg-surface-overlay border border-primary/50 rounded px-2 py-1 text-foreground outline-none resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commitText()
                  if (e.key === 'Escape') setEditingText(false)
                }}
              />
              <div className="flex gap-1.5">
                <button
                  onClick={commitText}
                  className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={() => setEditingText(false)}
                  className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className={cn(
                'text-sm leading-relaxed break-words',
                isActive ? 'text-foreground font-medium' : 'text-foreground/80'
              )}
            >
              {cue.text}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {!editingText && (
            <button
              onClick={startTextEdit}
              className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-surface-overlay"
              title="Edit text"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-surface-overlay"
            title="Delete cue"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SubtitleTimingEditor({
  cues,
  currentTime,
  activeCueId,
  onChange,
  onCueClick,
}: SubtitleTimingEditorProps) {
  const activeCue = cues.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  )

  const handleUpdate = (id: number, updated: SubtitleCue) => {
    onChange(cues.map((c) => (c.id === id ? updated : c)))
  }

  const handleDelete = (id: number) => {
    onChange(cues.filter((c) => c.id !== id))
  }

  const handleAdd = () => {
    const lastCue = cues[cues.length - 1]
    const start = lastCue ? lastCue.endTime + 0.5 : 0
    const newCue: SubtitleCue = {
      id: (cues[cues.length - 1]?.id ?? 0) + 1,
      startTime: start,
      endTime: start + 2,
      text: 'New subtitle',
    }
    onChange([...cues, newCue])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {cues.length} {cues.length === 1 ? 'cue' : 'cues'}
          </span>
          {activeCue && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-dim text-primary border border-primary/20">
              #{activeCue.id} active
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add cue
        </button>
      </div>

      {/* Cue list */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-0.5">
        {cues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No subtitles loaded</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Upload an .srt file to get started</p>
          </div>
        ) : (
          cues.map((cue) => (
            <CueRow
              key={cue.id}
              cue={cue}
              isActive={cue.id === activeCueId}
              isPlaying={activeCue?.id === cue.id}
              onChange={(updated) => handleUpdate(cue.id, updated)}
              onDelete={() => handleDelete(cue.id)}
              onClick={() => onCueClick?.(cue.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
