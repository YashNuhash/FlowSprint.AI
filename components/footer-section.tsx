"use client"

import { Twitter, Github, Linkedin } from "lucide-react"

export function FooterSection() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col items-center justify-center gap-8 py-10 md:py-16">
      {/* Project Name and Description */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-foreground text-xl font-semibold">FlowSprint.AI</div>
        <p className="text-foreground/90 text-sm font-medium text-center">From Idea to Code, Instantly</p>
      </div>
      
      {/* Social Links */}
      <div className="flex justify-center items-center gap-6">
        <a href="https://x.com/YashNuhash" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity">
          <Twitter className="w-full h-full text-muted-foreground" />
        </a>
        <a href="https://github.com/YashNuhash" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity">
          <Github className="w-full h-full text-muted-foreground" />
        </a>
        <a href="https://linkedin.com/in/ashraful-nuhash-2192871b2" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity">
          <Linkedin className="w-full h-full text-muted-foreground" />
        </a>
      </div>
      
      {/* Copyright */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs">&copy; {year} Ashraful Nuhash. All rights reserved.</p>
      </div>
    </footer>
  )
}
