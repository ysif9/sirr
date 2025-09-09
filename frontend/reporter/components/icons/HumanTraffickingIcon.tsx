import type React from "react"

interface HumanTraffickingIconProps {
  className?: string
}

export const HumanTraffickingIcon: React.FC<HumanTraffickingIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)
