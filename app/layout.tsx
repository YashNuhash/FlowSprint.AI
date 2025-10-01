import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import AuthProvider from '../components/auth-provider'
import './globals.css'
import '@xyflow/react/dist/style.css'

export const metadata: Metadata = {
  title: 'FlowSprint - AI-Powered Project Planning',
  description: 'Transform your ideas into structured projects with AI-powered mindmaps, PRDs, and code generation. Built with OpenRouter, Cerebras, and Meta Llama.',
  keywords: 'AI, project planning, mindmaps, PRD, code generation, OpenRouter, Cerebras, Meta Llama',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
