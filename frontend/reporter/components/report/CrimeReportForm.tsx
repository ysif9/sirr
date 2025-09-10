"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { FormDefinition, Field } from "@/lib/crime-forms"
import ReportStepper from "@/components/Stepper"
import RenderField from "./RenderField"
import { Button } from "../ui/button"

interface CrimeReportFormProps {
  formDefinition: FormDefinition
}

const CrimeReportForm: React.FC<CrimeReportFormProps> = ({ formDefinition }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const { control, watch, trigger, getValues } = useForm({
    mode: "onChange",
  })

  const handleNext = async () => {
    const fieldsToValidate = formDefinition.steps[currentStep - 1].fields.map((f: Field) => f.id)
    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < formDefinition.steps.length) {
      setCurrentStep(currentStep + 1)
    } else if (isValid && currentStep === formDefinition.steps.length) {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    console.log("Form Submitted:", getValues())
    alert("Report submitted successfully! (Check console for data)")
  }

  const activeStep = formDefinition.steps[currentStep - 1]

  return (
    <div className="max-w-3xl mx-auto p-8 bg-card border border-border rounded-2xl shadow-2xl">
      <div className="mb-10">
        <ReportStepper steps={formDefinition.steps} currentStep={currentStep} />
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-2xl font-bold text-card-foreground mb-6 border-b border-border pb-4">{activeStep.title}</h2>
        <div className="space-y-4">
          {activeStep.fields.map((field: Field) => (
            <RenderField key={field.id} control={control} field={field} watch={watch} />
          ))}
        </div>
      </form>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
          Previous Step
        </Button>
        <Button size="lg" onClick={handleNext}>
          {currentStep === formDefinition.steps.length ? "Submit Report" : "Next Step"}
        </Button>
      </div>
    </div>
  )
}

export default CrimeReportForm