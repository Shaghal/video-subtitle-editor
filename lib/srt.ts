export interface SubtitleCue {
  id: number
  startTime: number // seconds
  endTime: number   // seconds
  text: string
}

export interface SubtitleStyle {
  fontFamily: string
  fontSize: number       // px
  color: string          // hex
  strokeColor: string    // hex
  strokeWidth: number    // em units * 100 (e.g. 6 = 0.06em)
  bold: boolean
  italic: boolean
  shadow: boolean
  backdropEnabled: boolean
  backdropColor: string  // hex
  backdropOpacity: number // 0–100
}

export const DEFAULT_STYLE: SubtitleStyle = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 6,          // cqh units
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 6,
  bold: true,
  italic: false,
  shadow: true,
  backdropEnabled: false,
  backdropColor: '#000000',
  backdropOpacity: 60,
}

/** Parse a timestamp like "00:01:23,456" → seconds */
export function parseTimestamp(ts: string): number {
  const [hms, ms] = ts.trim().split(',')
  const [h, m, s] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + s + (Number(ms) / 1000)
}

/** Format seconds → "HH:MM:SS,mmm" */
export function formatTimestamp(seconds: number): string {
  const totalMs = Math.round(seconds * 1000)
  const ms = totalMs % 1000
  const totalSec = Math.floor(totalMs / 1000)
  const s = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  const m = totalMin % 60
  const h = Math.floor(totalMin / 60)
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':') + ',' + String(ms).padStart(3, '0')
}

/** Parse full SRT file content → array of SubtitleCue */
export function parseSrt(content: string): SubtitleCue[] {
  const blocks = content.trim().split(/\r?\n\r?\n/)
  const cues: SubtitleCue[] = []

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/)
    if (lines.length < 2) continue
    const id = parseInt(lines[0].trim(), 10)
    const timingLine = lines[1]
    const timingMatch = timingLine.match(
      /(\d{2}:\d{2}:\d{2}[,.:]\d{2,3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.:]\d{2,3})/
    )
    if (!timingMatch) continue

    const startTime = parseTimestamp(timingMatch[1].replace('.', ','))
    const endTime = parseTimestamp(timingMatch[2].replace('.', ','))
    const text = lines.slice(2).join('\n').trim()
    if (!text) continue

    cues.push({ id, startTime, endTime, text })
  }

  return cues.sort((a, b) => a.startTime - b.startTime)
}

/** Serialize cues back to SRT string */
export function serializeSrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue, i) =>
      `${i + 1}\n${formatTimestamp(cue.startTime)} --> ${formatTimestamp(cue.endTime)}\n${cue.text}`
    )
    .join('\n\n') + '\n'
}

/** Build the CSS string for @tscaps/engine based on SubtitleStyle */
export function buildCaptionCss(style: SubtitleStyle): string {
  const strokeEm = (style.strokeWidth / 100).toFixed(3)
  const shadow = style.shadow
    ? `text-shadow: 0 0.1em 0.3em rgba(0,0,0,0.7);`
    : ''
  const stroke = style.strokeWidth > 0
    ? `-webkit-text-stroke: ${strokeEm}em ${style.strokeColor}; paint-order: stroke fill;`
    : ''

  return `
    .segment {
      font-family: ${style.fontFamily};
      font-weight: ${style.bold ? '800' : '400'};
      font-style: ${style.italic ? 'italic' : 'normal'};
      font-size: ${style.fontSize}cqh;
      color: ${style.color};
      ${stroke}
      ${shadow}
      text-align: center;
      line-height: 1.25;
    }
    .line { display: block; text-align: center; }
    .word { display: inline-block; margin: 0 0.1em; }
  `.trim()
}
