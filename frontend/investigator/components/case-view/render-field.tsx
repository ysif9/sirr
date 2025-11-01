"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info, MapPin, ImageIcon, FileText, Loader2 } from "lucide-react";
import type { Field } from "@/lib/crime-forms";
import type { IApiAttachment } from "@/lib/mock-data";
import { decryptAttachment } from "@/lib/crypto";

interface RenderFieldProps {
  field: Field;
  formData: { [key: string]: any };
  allAttachments: IApiAttachment[];
  attachmentKeys: { [key: string]: string };
}

const FieldWrapper = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
    <label className="font-semibold text-sm text-muted-foreground md:col-span-1">{label}</label>
    <div className="md:col-span-2">{children}</div>
  </div>
);

// Helper function to get generic attachment name based on mime type
const getGenericAttachmentName = (mimeType?: string): string => {
  if (!mimeType) return 'File attachment';
  if (mimeType.startsWith('image/')) return 'Image attachment';
  if (mimeType.startsWith('video/')) return 'Video attachment';
  if (mimeType.startsWith('audio/')) return 'Audio attachment';
  if (mimeType.includes('pdf')) return 'PDF attachment';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Document attachment';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet attachment';
  return 'File attachment';
};

const DecryptedAttachment = ({ attachment, decryptionKey }: { attachment: IApiAttachment; decryptionKey: string; }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const genericName = getGenericAttachmentName(attachment.mime_type);

  // Cleanup object URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleDecrypt = async () => {
    if (!decryptionKey || !attachment.nonce) return;
    setIsLoading(true);
    const blob = await decryptAttachment(attachment.file, decryptionKey, attachment.nonce);
    setIsLoading(false);
    if (blob) {
      setObjectUrl(URL.createObjectURL(blob));
    }
  };

  if (objectUrl) {
    return (
      <a href={objectUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-muted rounded-lg overflow-hidden group">
        <img src={objectUrl} alt="Decrypted attachment" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      </a>
    );
  }

  return (
    <div onClick={handleDecrypt} className="cursor-pointer flex flex-col items-center justify-center text-center aspect-square bg-muted rounded-lg overflow-hidden group p-2">
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <>
          {attachment.mime_type.startsWith("image/") ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          <p className="text-xs mt-1 truncate">{genericName}</p>
          <Button variant="link" size="sm" className="text-xs">Decrypt to view</Button>
        </>
      )}
    </div>
  );
}


export default function RenderField({ field, formData, allAttachments, attachmentKeys }: RenderFieldProps) {
  const value = formData[field.id];

  if (field.conditional) {
    const dependentValue = formData[field.conditional.field];
    if (dependentValue !== field.conditional.value) {
      return null;
    }
  }

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
          <p className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />{value}</p>
        </FieldWrapper>
      )
    case "file_upload":
      if (allAttachments.length === 0) {
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
            {allAttachments.map(att => (
              <DecryptedAttachment
                key={att.id}
                attachment={att}
                decryptionKey={attachmentKeys[att.id]}
              />
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
