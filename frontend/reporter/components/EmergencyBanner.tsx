"use client"

import type React from "react"

const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white text-center p-4 text-xs md:text-sm font-semibold shadow-lg">
      <p>This platform is not a substitute for emergency services.</p>
      <p>
        If you are experiencing an emergency, please dial{" "}
        <a href="tel:122" className="underline font-bold">
          122
        </a>{" "}
        immediately.
      </p>
    </div>
  )
}

export default EmergencyBanner