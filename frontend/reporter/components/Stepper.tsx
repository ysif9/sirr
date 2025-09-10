"use client"

import React from "react"
import { Stepper, Step, StepIndicator, StepTitle, StepperSeparator } from "@/components/ui/stepper"

interface ReportStepperProps {
  steps: { title: string }[]
  currentStep: number
}

const ReportStepper: React.FC<ReportStepperProps> = ({ steps, currentStep }) => {
  return (
    <Stepper>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const state = currentStep === stepNumber ? "active" : currentStep > stepNumber ? "completed" : "inactive"

        return (
          <React.Fragment key={step.title}>
            <Step state={state} className={index === 0 ? "flex-initial" : "flex-1"}>
              <div className="flex flex-col items-center gap-2">
                <StepIndicator state={state}>{stepNumber}</StepIndicator>
                <StepTitle state={state}>{step.title}</StepTitle>
              </div>
            </Step>
            {index < steps.length - 1 && (
              <StepperSeparator state={currentStep > stepNumber ? "active" : "inactive"} className="mx-4" />
            )}
          </React.Fragment>
        )
      })}
    </Stepper>
  )
}

export default ReportStepper