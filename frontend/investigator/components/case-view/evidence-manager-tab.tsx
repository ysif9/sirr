"use client";

import { useState } from "react";
import {
  FileText, ImageIcon, VideoIcon, FileAudio, Download, Eye, Tag, BookUser, Loader2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ICaseInfo, IApiAttachment } from "@/lib/mock-data";
import { decryptAttachment } from "@/lib/crypto";

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
  if (mimeType.startsWith("video/")) return <VideoIcon className="h-8 w-8 text-muted-foreground" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="h-8 w-8 text-muted-foreground" />;
  return <FileText className="h-8 w-8 text-muted-foreground" />;
};

const getFileType = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  return "Document";
}

const EvidenceDetailView = ({ evidence, decryptionKey }: { evidence: IApiAttachment; decryptionKey: string }) => {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileType = getFileType(evidence.mime_type);

  const handleDecryptAndDisplay = async () => {
    if (!decryptionKey || !evidence.nonce) {
      setError("Missing key or nonce for decryption.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDecryptedUrl(null);

    const blob = await decryptAttachment(evidence.file, decryptionKey, evidence.nonce);
    setIsLoading(false);

    if (blob) {
      const url = URL.createObjectURL(blob);
      setDecryptedUrl(url);
    } else {
      setError("Decryption failed. The file may be corrupt or the key is incorrect.");
    }
  };
  
  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{evidence.file.split('/').pop()}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="md:col-span-2">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {decryptedUrl ? (
              fileType === 'Image' ? <img src={decryptedUrl} alt="Decrypted content" className="w-full h-full object-contain" /> :
              fileType === 'Video' ? <video src={decryptedUrl} controls className="w-full h-full" /> :
              <a href={decryptedUrl} download={evidence.file.split('/').pop()}>Download decrypted file</a>
            ) : (
              <div className="text-center p-4">
                {getFileIcon(evidence.mime_type)}
                <p className="text-muted-foreground mt-2 text-sm">Preview of encrypted file.</p>
                <Button onClick={handleDecryptAndDisplay} disabled={isLoading} className="mt-4">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  Decrypt and View
                </Button>
                {error && <p className="text-destructive text-xs mt-2">{error}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>End-to-End Encrypted</AlertTitle>
            <AlertDescription>
              This file is stored encrypted and is decrypted only on your device.
            </AlertDescription>
          </Alert>
          <div>
            <h3 className="font-semibold">Metadata</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li><span className="font-medium text-foreground">Evidence ID:</span> {evidence.id.slice(0, 8)}</li>
              <li><span className="font-medium text-foreground">File Type:</span> {evidence.mime_type}</li>
            </ul>
          </div>
        </div>
      </div>
    </DialogContent>
  )
};

interface EvidenceManagerTabProps {
  caseData: ICaseInfo;
}

export default function EvidenceManagerTab({ caseData }: EvidenceManagerTabProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {caseData.attachments.map((att) => (
        <Dialog key={att.id}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {getFileIcon(att.mime_type)}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{att.file.split('/').pop()}</p>
                <p className="text-xs text-muted-foreground">ID: {att.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{att.mime_type}</p>
              </div>
            </div>
          </DialogTrigger>
          <EvidenceDetailView evidence={att} decryptionKey={caseData.attachmentKeys[att.id]} />
        </Dialog>
      ))}
    </div>
  );
}