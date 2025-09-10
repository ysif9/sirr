"use client"

import type React from "react"
import { useState } from "react"
import EmergencyBanner from "./EmergencyBanner"
import Hero from "./Hero"
import Footer from "./Footer"
import FAQModal from "./FAQModal"
import LightRays from "./LightRays"

interface LandingPageProps {
  onNavigate: (page: string) => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)

  return (
    <>
      <div className="bg-transparent text-gray-300 flex flex-col min-h-screen relative isolate">
        <div className="absolute inset-0 w-full h-full -z-10">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays"
          />
        </div>
        <EmergencyBanner />
        <main className="pt-16 flex-grow flex items-center justify-center">
          <Hero onNavigate={onNavigate} />
        </main>
        <Footer onNavigate={onNavigate} onOpenFaq={() => setIsFaqModalOpen(true)} />
      </div>
      {isFaqModalOpen && <FAQModal onClose={() => setIsFaqModalOpen(false)} />}
    </>
  )
}

export default LandingPage