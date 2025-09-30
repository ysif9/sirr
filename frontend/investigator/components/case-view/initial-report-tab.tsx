// START OF components/case-view/initial-report-tab.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFormDefinition } from "@/lib/crime-forms";
import type { ICaseInfo } from "@/lib/mock-data";
import RenderField from "./render-field";

interface InitialReportTabProps {
  caseData: ICaseInfo;
}

export default function InitialReportTab({ caseData }: InitialReportTabProps) {
  const formDefinition = getFormDefinition(
    caseData.formKey.reportTypeKey,
    caseData.formKey.categoryKey,
    caseData.formKey.formKey
  );

  if (!formDefinition) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Could not load the report form template for this case.</p>
        <p className="text-xs">Form Keys: {caseData.formKey.reportTypeKey}, {caseData.formKey.categoryKey}, {caseData.formKey.formKey}</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={["step-1"]} className="w-full">
      {formDefinition.steps.map((step) => (
        <AccordionItem key={step.step} value={`step-${step.step}`}>
          <AccordionTrigger className="text-lg font-semibold">
            {step.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {step.fields.map((field) => (
              <RenderField
                key={field.id}
                field={field}
                formData={caseData.formData}
                allAttachments={caseData.attachments}
                attachmentKeys={caseData.attachmentKeys}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
// END OF components/case-view/initial-report-tab.tsx