import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const stepperVariants = cva("flex items-center w-full")

interface StepperProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stepperVariants> {}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(stepperVariants({ className }))} {...props} />
))
Stepper.displayName = "Stepper"

const stepVariants = cva("flex flex-col items-center gap-2 relative")

interface StepProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stepVariants> {
  state?: "active" | "inactive" | "completed"
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(stepVariants({ className }))} {...props} />
))
Step.displayName = "Step"

const stepIndicatorVariants = cva(
  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
  {
    variants: {
      state: {
        active: "border-white bg-white text-slate-900 scale-110 shadow-lg shadow-white/20",
        inactive: "border-gray-600 bg-slate-800 text-gray-400",
        completed: "border-white/50 bg-white/10 text-white",
      },
    },
    defaultVariants: {
      state: "inactive",
    },
  }
)

interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stepIndicatorVariants> {
  state?: "active" | "inactive" | "completed"
}

const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ className, state, children, ...props }, ref) => (
    <div ref={ref} className={cn(stepIndicatorVariants({ state, className }))} {...props}>
      {state === "completed" ? <CheckIcon className="w-6 h-6" /> : <span className="font-bold text-sm">{children}</span>}
    </div>
  )
)
StepIndicator.displayName = "StepIndicator"

const stepTitleVariants = cva("text-xs text-center transition-colors duration-300 max-w-20", {
  variants: {
    state: {
      active: "text-white font-semibold",
      inactive: "text-gray-400",
      completed: "text-gray-300",
    },
  },
  defaultVariants: {
    state: "inactive",
  },
})

interface StepTitleProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof stepTitleVariants> {
  state?: "active" | "inactive" | "completed"
}

const StepTitle = React.forwardRef<HTMLSpanElement, StepTitleProps>(({ className, state, ...props }, ref) => (
  <span ref={ref} className={cn(stepTitleVariants({ state, className }))} {...props} />
))
StepTitle.displayName = "StepTitle"

const separatorVariants = cva("flex-1 h-0.5 transition-colors duration-300", {
  variants: {
    state: {
      active: "bg-white",
      inactive: "bg-gray-600",
    },
  },
  defaultVariants: {
    state: "inactive",
  },
})

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof separatorVariants> {}

const StepperSeparator = React.forwardRef<HTMLDivElement, SeparatorProps>(({ className, state, ...props }, ref) => (
  <div ref={ref} className={cn(separatorVariants({ state, className }))} {...props} />
))
StepperSeparator.displayName = "StepperSeparator"

export { Stepper, Step, StepIndicator, StepTitle, StepperSeparator }