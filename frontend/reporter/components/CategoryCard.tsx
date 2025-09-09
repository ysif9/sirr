import type React from "react"
import { Squircle } from "@squircle-js/react"

interface CategoryCardProps {
  title: string
  subtitle: string
  onClick?: () => void
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, subtitle, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group h-full w-full text-left transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      disabled={!onClick}
    >
      <Squircle
        cornerRadius={16}
        cornerSmoothing={1}
        className="h-full w-full p-6 bg-white/5 border border-white/10 shadow-lg group-hover:bg-white/8 group-hover:border-white/15 group-hover:shadow-xl group-hover:shadow-white/5 transition-all duration-300 ease-out"
      >
        <div className="flex flex-col h-full">
          <h3 className="text-3xl font-extrabold text-white mb-4">{title}</h3>
          <p className="text-gray-400 flex-grow transition-colors duration-300 group-hover:text-gray-300">{subtitle}</p>
        </div>
      </Squircle>
    </button>
  )
}
