import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SubCraft Editor — Subtitle Editor',
  description: 'Edit subtitle timing, style fonts and colors, then download your .srt or burn hardcoded subtitles into your video.',
}

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
