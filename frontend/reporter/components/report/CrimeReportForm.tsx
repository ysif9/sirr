// FILE: components/report/CrimeReportForm.tsx

"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { FormDefinition, Field } from "@/lib/crime-forms"
import ReportStepper from "@/components/Stepper"
import RenderField from "./RenderField"
import { Button } from "../ui/button"
import { Squircle } from "@squircle-js/react"
import SubmissionSuccess from "./SubmissionSuccess"

interface CrimeReportFormProps {
  formDefinition: FormDefinition
}

const CrimeReportForm: React.FC<CrimeReportFormProps> = ({ formDefinition }) => {
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

    // --- FIX: Hardcode the API URL to bypass environment variable issues ---
    const API_BASE_URL = "http://localhost:8000";
    console.log("Using API Base URL (hardcoded):", API_BASE_URL);

    try {
      if (!API_BASE_URL) { // This check is now redundant but safe
          throw new Error("API URL is not configured.");
      }

      const apiUrl = `${API_BASE_URL}/api/reports/`;
      console.log("Sending POST request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: getValues() }),
      });

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error(`Expected JSON response, but received ${response.statusText}. Response body: ${textResponse.substring(0, 200)}...`);
      }
      
      const result = await response.json();

      if (!response.ok) {
        const errorMessage = Object.values(result).flat().join(" ") || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }
      setSubmissionData(result);
    } catch (error: any) {
      console.error("Submission Error:", error);
      setSubmissionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNext = async () => {
    const fieldsToValidate = formDefinition.steps[currentStep - 1].fields.map((f: Field) => f.id);
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < formDefinition.steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === formDefinition.steps.length) {
      await handleSubmit();
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  const handleReset = () => {
    reset();
    setCurrentStep(1);
    setSubmissionData(null);
    setSubmissionError(null);
  }

  const activeStep = formDefinition.steps[currentStep - 1];
  const isLastStep = currentStep === formDefinition.steps.length;

  if (submissionData) {
    return (
      <Squircle
        className="max-w-3xl mx-auto p-8 bg-card border border-border shadow-2xl transition-all duration-300"
        cornerRadius={30}
        cornerSmoothing={1}
      >
        <SubmissionSuccess accessKey={submissionData.access_key} onReset={handleReset} />
      </Squircle>
    );
  }

  return (
    <Squircle
      className="max-w-3xl mx-auto p-8 bg-card border border-border shadow-2xl transition-all duration-300"
      cornerRadius={30}
      cornerSmoothing={1}
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

      {submissionError && <div className="mt-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">{submissionError}</div>}

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || isSubmitting}>
          Previous Step
        </Button>
        <Button size="lg" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : isLastStep ? "Submit Report" : "Next Step"}
        </Button>
      </div>
    </Squircle>
  );
}

export default CrimeReportForm;