// START OF components/case-view/render-field.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, MapPin } from "lucide-react";
import type { Field } from "@/lib/crime-forms";
import type { IAttachment } from "@/lib/mock-data";

interface RenderFieldProps {
  field: Field;
  formData: { [key: string]: any };
  allAttachments: IAttachment[];
}

const FieldWrapper = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
    <label className="font-semibold text-sm text-muted-foreground md:col-span-1">{label}</label>
    <div className="md:col-span-2">{children}</div>
  </div>
);

export default function RenderField({ field, formData, allAttachments }: RenderFieldProps) {
  const value = formData[field.id];

  // Handle conditional fields
  if (field.conditional) {
    const dependentValue = formData[field.conditional.field];
    if (dependentValue !== field.conditional.value) {
      return null;
    }
  }

  // Handle simple value types
  if (!value && field.type !== "static_text" && field.type !== "file_upload") {
    return (
      <FieldWrapper label={field.label}>
        <p className="text-sm text-muted-foreground italic">Not provided</p>
      </FieldWrapper>
    );
  }

  switch (field.type) {
    case "text":
    case "number":
    case "date":
    case "time":
    case "datetime":
    case "select":
    case "radio_group":
      return (
        <FieldWrapper label={field.label}>
          <p className="text-sm">{value}</p>
        </FieldWrapper>
      );
    case "textarea":
      return (
        <div>
          <label className="font-semibold text-sm text-muted-foreground block mb-2">{field.label}</label>
          <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{value}</p>
        </div>
      );
    case "location":
       return (
        <FieldWrapper label={field.label}>
            <div className="space-y-2">
                <p className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4"/>{value}</p>
                <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Map Preview</p>
                </div>
            </div>
        </FieldWrapper>
       )
    case "file_upload":
      const attachments = allAttachments.filter((att) => att.type === "Image" || att.type === "Video");
      if (attachments.length === 0) {
        return (
          <FieldWrapper label={field.label}>
            <p className="text-sm text-muted-foreground italic">No files uploaded</p>
          </FieldWrapper>
        );
      }
      return (
        <div>
          <label className="font-semibold text-sm text-muted-foreground block mb-2">{field.label}</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {attachments.map(att => (
              <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-muted rounded-lg overflow-hidden group">
                 <img src={att.url} alt={att.fileName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </a>
            ))}
          </div>
        </div>
      )
    case "repeater":
      const items = value as any[];
      if (!items || items.length === 0) {
        return (
          <FieldWrapper label={field.label}>
            <p className="text-sm text-muted-foreground italic">No items listed</p>
          </FieldWrapper>
        )
      }
      return (
        <div>
           <label className="font-semibold text-sm text-muted-foreground block mb-2">{field.label}</label>
            <Table>
                <TableHeader>
                    <TableRow>
                        {field.fields?.map(f => <TableHead key={f.id}>{f.label}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            {field.fields?.map(f => <TableCell key={f.id}>{item[f.id] || "N/A"}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      )
    case "static_text":
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>{field.text}</AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
}
// END OF components/case-view/render-field.tsx