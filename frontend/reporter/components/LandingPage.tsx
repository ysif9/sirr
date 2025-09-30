"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import EmergencyBanner from "./EmergencyBanner"
import DNSBanner from "./DNSBanner"
import Hero from "./Hero"
import Footer from "./Footer"
import FAQModal from "./FAQModal"
import LightRays from "./LightRays"

const LandingPage: React.FC = () => {
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // This effect runs once to measure the height of the fixed header
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

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
        
        {/* A fixed container for both banners */}
        <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 w-full">
          <EmergencyBanner />
          <DNSBanner />
        </header>

        {/* Main content area now has dynamic padding-top to avoid being covered by the banners */}
        <main 
          className="flex-grow flex items-center justify-center"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          <Hero />
        </main>

        <Footer onOpenFaq={() => setIsFaqModalOpen(true)} />
      </div>
      {isFaqModalOpen && <FAQModal onClose={() => setIsFaqModalOpen(false)} />}
    </>
  )
}

export default LandingPage