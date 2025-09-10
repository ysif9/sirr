"use client"

import React from "react"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper"

interface ReportStepperProps {
  steps: { title: string }[]
  currentStep: number
}

const ReportStepper: React.FC<ReportStepperProps> = ({ steps, currentStep }) => {
  return (
    <Stepper value={currentStep} className="w-full">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        return (
          <StepperItem key={step.title} step={stepNumber} className="not-last:flex-1">
            <StepperTrigger asChild>
              <StepperIndicator />
            </StepperTrigger>
            {index < steps.length - 1 && <StepperSeparator />}
          </StepperItem>
        )
      })}
    </Stepper>
  )
}

export default ReportStepper