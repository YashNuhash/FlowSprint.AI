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
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Convert percentage positions to actual pixels
      const actualNodes = nodes.map((node) => ({
        x: (node.x / 100) * canvas.width,
        y: (node.y / 100) * canvas.height,
        size: node.size,
      }))

      actualNodes.forEach((node1, i) => {
        actualNodes.forEach((node2, j) => {
          if (i >= j) return // Avoid duplicate lines

          const distance = Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2))

          // Only connect nodes within a certain distance
          const maxDistance = canvas.width * 0.4

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance

            // Draw glow effect
            ctx.beginPath()
            ctx.moveTo(node1.x, node1.y)
            ctx.lineTo(node2.x, node2.y)
            ctx.strokeStyle = `rgba(200, 200, 200, ${opacity * 0.15})`
            ctx.lineWidth = 4
            ctx.shadowBlur = 15
            ctx.shadowColor = `rgba(200, 200, 200, ${opacity * 0.5})`
            ctx.stroke()

            // Draw main line on top
            ctx.beginPath()
            ctx.moveTo(node1.x, node1.y)
            ctx.lineTo(node2.x, node2.y)
            ctx.strokeStyle = `rgba(220, 220, 220, ${opacity * 0.4})`
            ctx.lineWidth = 2
            ctx.shadowBlur = 8
            ctx.shadowColor = `rgba(220, 220, 220, ${opacity * 0.6})`
            ctx.stroke()

            // Reset shadow
            ctx.shadowBlur = 0
          }
        })
      })
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
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-700/20 to-gray-600/10 backdrop-blur-sm border border-gray-600/30 shadow-lg shadow-gray-700/20" />
      </div>

      {/* Node 2 - Top Right */}
      <div className="absolute top-32 right-16 animate-float-slow" style={{ animationDelay: "2s" }}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-600/15 to-gray-700/20 backdrop-blur-sm border border-gray-600/25 shadow-xl shadow-gray-600/15" />
      </div>

      {/* Node 3 - Middle Left */}
      <div className="absolute top-1/3 left-20 animate-float-reverse" style={{ animationDelay: "1s" }}>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-700/25 to-gray-800/15 backdrop-blur-sm border border-gray-700/35 shadow-lg shadow-gray-700/25 rotate-12" />
      </div>

      {/* Node 4 - Middle Right */}
      <div className="absolute top-1/2 right-24 animate-float" style={{ animationDelay: "3s" }}>
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-600/20 to-gray-700/15 backdrop-blur-sm border border-gray-600/30 shadow-xl shadow-gray-600/20" />
      </div>

      {/* Node 5 - Bottom Left */}
      <div className="absolute bottom-40 left-16 animate-float-slow" style={{ animationDelay: "4s" }}>
        <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-gray-700/15 to-gray-600/25 backdrop-blur-sm border border-gray-700/25 shadow-2xl shadow-gray-700/15 -rotate-6" />
      </div>

      {/* Node 6 - Bottom Right */}
      <div className="absolute bottom-32 right-20 animate-float-reverse" style={{ animationDelay: "1.5s" }}>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800/20 to-gray-700/20 backdrop-blur-sm border border-gray-800/30 shadow-lg shadow-gray-800/20" />
      </div>

      {/* Node 7 - Center Top */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: "2.5s" }}>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-600/20 to-gray-700/15 backdrop-blur-sm border border-gray-600/25 shadow-lg shadow-gray-600/15 rotate-45" />
      </div>

      {/* Node 8 - Lower Center */}
      <div className="absolute bottom-1/4 left-1/3 animate-float-slow" style={{ animationDelay: "3.5s" }}>
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-700/20 to-gray-800/15 backdrop-blur-sm border border-gray-700/30 shadow-xl shadow-gray-700/20" />
      </div>
    </div>
  )
}
