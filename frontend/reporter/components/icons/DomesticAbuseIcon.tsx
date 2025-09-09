import type React from "react"

interface DomesticAbuseIconProps {
  className?: string
}

export const DomesticAbuseIcon: React.FC<DomesticAbuseIconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v2" />
  </svg>
)
