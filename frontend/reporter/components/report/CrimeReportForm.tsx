"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { FormDefinition, Field } from "@/lib/crime-forms"
import { submitReport } from "@/lib/api"
import ReportStepper from "@/components/Stepper"
import RenderField from "./RenderField"
import { Button } from "../ui/button"
import SubmissionSuccess from "./SubmissionSuccess"
import { useTranslations } from "next-intl"

interface CrimeReportFormProps {
  formDefinition: FormDefinition
  formIdentifier: {
    reportTypeKey: string
    categoryKey: string
    formKey: string
  }
}

const CrimeReportForm: React.FC<CrimeReportFormProps> = ({ formDefinition, formIdentifier }) => {
  const t = useTranslations("CrimeReportForm");
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionData, setSubmissionData] = useState<{ access_key: string } | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const { control, watch, trigger, getValues, reset } = useForm({
    mode: "onChange",
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const allFormValues = getValues()
      
      // Dynamically find all file upload fields from the form definition
      const fileFieldIds = new Set(
        formDefinition.steps.flatMap(step => 
          step.fields
            .filter(field => field.type === 'file_upload')
            .map(field => field.id)
        )
      );

      const reportData: { [key: string]: any } = {};
      const allAttachments: File[] = [];

      // Separate file data from other form data
      for (const key in allFormValues) {
        if (fileFieldIds.has(key)) {
          const files = allFormValues[key];
          if (Array.isArray(files)) {
            // Filter out any non-File objects just in case
            allAttachments.push(...files.filter(f => f instanceof File));
          }
        } else {
          reportData[key] = allFormValues[key];
        }
      }

      const result = await submitReport(reportData, allAttachments, formIdentifier, formDefinition.title)
      setSubmissionData(result)
    } catch (error: any) {
      console.error("Submission Error:", error)
      setSubmissionError(error.message || t("submissionError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const fieldsToValidate = formDefinition.steps[currentStep - 1].fields.map((f: Field) => f.id)
    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < formDefinition.steps.length) {
      setCurrentStep(currentStep + 1)
    } else if (isValid && currentStep === formDefinition.steps.length) {
      await handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    reset()
    setCurrentStep(1)
    setSubmissionData(null)
    setSubmissionError(null)
  }

  const activeStep = formDefinition.steps[currentStep - 1]
  const isLastStep = currentStep === formDefinition.steps.length

  if (submissionData) {
    return (
      <div
        className="max-w-3xl mx-auto p-8 bg-card border border-border shadow-2xl transition-all duration-300 rounded-[1.875rem]"
      >
        <SubmissionSuccess accessKey={submissionData.access_key} onReset={handleReset} />
      </div>
    )
  }

  return (
    <div
      className="max-w-3xl mx-auto p-8 bg-card border border-border shadow-2xl transition-all duration-300 rounded-[1.875rem]"
    >
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

      {submissionError && (
        <div className="mt-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
          {submissionError}
        </div>
      )}

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || isSubmitting}>
          {t('previousStep')}
        </Button>
        <Button size="lg" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? t('submitting') : isLastStep ? t('submitReport') : t('nextStep')}
        </Button>
      </div>
    </div>
  )
}

export default CrimeReportForm