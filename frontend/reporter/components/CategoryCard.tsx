import type React from "react"
import { Squircle } from "@squircle-js/react"

interface CategoryCardProps {
  icon: React.ElementType
  title: string
  subtitle: string
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, subtitle }) => {
  const IconComponent = icon
  return (
    <button className="group h-full w-full text-left transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
      <Squircle
        cornerRadius={16}
        cornerSmoothing={1}
        className="h-full w-full p-6 bg-white/5 border border-white/10 shadow-lg group-hover:bg-white/8 group-hover:border-white/15 group-hover:shadow-xl group-hover:shadow-white/5 transition-all duration-300 ease-out"
      >
        <div className="flex flex-col h-full">
          <div className="text-gray-400 group-hover:text-white transition-all duration-300 ease-out mb-4 transform group-hover:scale-105">
            <IconComponent className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 transition-all duration-300 group-hover:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-400 flex-grow transition-colors duration-300 group-hover:text-gray-300">{subtitle}</p>
        </div>
      </Squircle>
    </button>
  )
}
