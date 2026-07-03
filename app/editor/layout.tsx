import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SubCraft Editor — Edit & Burn Subtitles',
  description: 'Style, time, and burn subtitles into your video. No installation, no uploads, all in your browser.',
}

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
