"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "What is FlowSprint and who is it for?",
    answer:
      "FlowSprint is an AI-powered project planning and code generation platform designed for developers, product managers, and teams who want to accelerate their development workflow. It's perfect for those who want to quickly turn ideas into structured projects with comprehensive PRDs, mindmaps, and production-ready code.",
  },
  {
    question: "How does FlowSprint's AI PRD generation work?",
    answer:
      "Our AI analyzes your project description and automatically generates comprehensive Product Requirements Documents (PRDs) including user stories, technical specifications, and implementation details. It uses advanced AI models to understand context and create detailed, actionable documentation that guides your entire development process.",
  },
  {
    question: "What AI providers does FlowSprint use?",
    answer:
      "FlowSprint leverages multiple AI providers including OpenRouter, Cerebras, and Meta Llama. Our intelligent routing system automatically selects the best AI service based on your request complexity, ensuring optimal performance and cost-efficiency. This multi-provider approach gives you the flexibility and reliability you need.",
  },
  {
    question: "What's included in the free plan?",
    answer:
      "The free plan includes AI-powered PRD generation, interactive mindmap visualization, basic code generation, project management with CRUD operations, and access to our multi-provider AI routing. It's perfect for individual developers and small teams getting started with AI-assisted project planning.",
  },
  {
    question: "How does the mindmap visualization work?",
    answer:
      "FlowSprint automatically generates interactive mindmaps that visualize your project structure, dependencies, and component relationships. You can explore your project architecture visually, see how different parts connect, and understand the big picture before diving into implementation. The mindmaps are generated in real-time from your project requirements.",
  },
  {
    question: "Is my project data secure with FlowSprint?",
    answer:
      "Absolutely. We use enterprise-grade security measures including MongoDB Atlas for secure data storage, NextAuth for authentication, and secure API communications. Your project data is encrypted in transit and at rest. We also provide Google OAuth integration for secure, hassle-free authentication without storing passwords.",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Everything you need to know about FlowSprint and how it can transform your development workflow
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
