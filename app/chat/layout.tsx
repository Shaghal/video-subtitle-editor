import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SubCraft Chat — Subtitle Editor',
  description: 'Chat-based subtitle editor with video preview and AI-style interface.',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
