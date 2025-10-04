import Image from "next/image" // Import the Image component
import GlowBorder from "@/components/ui/glow-border"

export function DashboardPreview() {
  return (
    <div className="w-[calc(100vw-32px)] md:w-[1160px]">
      <div className="relative bg-primary-light/50 rounded-2xl p-2 shadow-2xl">
        {/* Glowing border effect */}
        <GlowBorder 
          color={['#60a5fa', '#a78bfa', '#f472b6', '#60a5fa']} 
          borderRadius={16}
          borderWidth={50}
          duration={8}
        />
        
        <Image
          src="/images/dashboard-preview-demo.png"
          alt="Dashboard preview"
          width={1160}
          height={700}
          className="w-full h-full object-cover rounded-xl shadow-lg relative z-10"
        />
      </div>
    </div>
  )
}
