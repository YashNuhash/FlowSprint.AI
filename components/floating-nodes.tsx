"use client"

import { useEffect, useRef } from "react"

export function FloatingNodes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const nodes = [
    { x: 10, y: 20, size: 24 }, // Top Left (percentages)
    { x: 85, y: 32, size: 32 }, // Top Right
    { x: 20, y: 33, size: 20 }, // Middle Left
    { x: 80, y: 50, size: 28 }, // Middle Right
    { x: 16, y: 70, size: 36 }, // Bottom Left
    { x: 82, y: 75, size: 24 }, // Bottom Right
    { x: 50, y: 24, size: 20 }, // Center Top
    { x: 33, y: 75, size: 28 }, // Lower Center
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawConnections()
    }

    const drawConnections = () => {
      // Clear canvas but don't draw any connections - just clean floating nodes
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.9 }} />

      {/* Node 1 - Top Left */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/15 backdrop-blur-sm border border-blue-400/40 shadow-lg shadow-blue-500/25" />
      </div>

      {/* Node 2 - Top Right */}
      <div className="absolute top-32 right-16 animate-float-slow" style={{ animationDelay: "2s" }}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/15 backdrop-blur-sm border border-purple-400/35 shadow-xl shadow-purple-500/20" />
      </div>

      {/* Node 3 - Middle Left */}
      <div className="absolute top-1/3 left-20 animate-float-reverse" style={{ animationDelay: "1s" }}>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/20 backdrop-blur-sm border border-cyan-400/45 shadow-lg shadow-cyan-500/30 rotate-12" />
      </div>

      {/* Node 4 - Middle Right */}
      <div className="absolute top-1/2 right-24 animate-float" style={{ animationDelay: "3s" }}>
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500/25 to-purple-600/20 backdrop-blur-sm border border-indigo-400/40 shadow-xl shadow-indigo-500/25" />
      </div>

      {/* Node 5 - Bottom Left */}
      <div className="absolute bottom-40 left-16 animate-float-slow" style={{ animationDelay: "4s" }}>
        <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-600/25 backdrop-blur-sm border border-teal-400/35 shadow-2xl shadow-teal-500/20 -rotate-6" />
      </div>

      {/* Node 6 - Bottom Right */}
      <div className="absolute bottom-32 right-20 animate-float-reverse" style={{ animationDelay: "1.5s" }}>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/25 to-purple-600/20 backdrop-blur-sm border border-violet-400/40 shadow-lg shadow-violet-500/25" />
      </div>

      {/* Node 7 - Center Top */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: "2.5s" }}>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-500/25 to-blue-600/20 backdrop-blur-sm border border-sky-400/40 shadow-lg shadow-sky-500/25 rotate-45" />
      </div>

      {/* Node 8 - Lower Center */}
      <div className="absolute bottom-1/4 left-1/3 animate-float-slow" style={{ animationDelay: "3.5s" }}>
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-600/20 backdrop-blur-sm border border-emerald-400/40 shadow-xl shadow-emerald-500/25" />
      </div>
    </div>
  )
}
