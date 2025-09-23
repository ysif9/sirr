// START OF components/case-view/evidence-manager-tab.tsx
import {
  FileText,
  ImageIcon,
  VideoIcon,
  FileAudio,
  Download,
  Eye,
  Tag,
  BookUser,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IAttachment, ICaseInfo } from "@/lib/mock-data";

interface EvidenceManagerTabProps {
  caseData: ICaseInfo;
}

const getFileIcon = (type: IAttachment["type"]) => {
  switch (type) {
    case "Image":
      return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
    case "Video":
      return <VideoIcon className="h-8 w-8 text-muted-foreground" />;
    case "Audio":
      return <FileAudio className="h-8 w-8 text-muted-foreground" />;
    default:
      return <FileText className="h-8 w-8 text-muted-foreground" />;
  }
};

const EvidenceDetailView = ({ evidence }: { evidence: IAttachment }) => (
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>{evidence.fileName}</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      <div className="md:col-span-2">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {evidence.type === "Image" ? (
            <img
              src={evidence.url}
              alt={evidence.fileName}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              {getFileIcon(evidence.type)}
              <p className="text-muted-foreground mt-2">
                Live preview not available for this file type.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Tag className="h-4 w-4" /> Notes & Tags</h3>
          <p className="text-sm text-muted-foreground mt-2">No notes added.</p>
        </div>
        <div>
            <h3 className="font-semibold">Metadata</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li><span className="font-medium text-foreground">Evidence ID:</span> {evidence.id.slice(0,8)}</li>
                <li><span className="font-medium text-foreground">File Type:</span> {evidence.type}</li>
                <li><span className="font-medium text-foreground">Uploaded:</span> {new Date(evidence.timestamp).toLocaleString()}</li>
            </ul>
        </div>
        <div>
          <h3 className="font-semibold flex items-center gap-2"><BookUser className="h-4 w-4" /> Chain of Custody</h3>
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Reporter</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>{new Date(evidence.timestamp).toLocaleDateString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Admin User</TableCell>
                <TableCell>Viewed</TableCell>
                <TableCell>{new Date().toLocaleDateString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </DialogContent>
);

export default function EvidenceManagerTab({ caseData }: EvidenceManagerTabProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {caseData.attachments.map((att) => (
        <Dialog key={att.id}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {att.type === "Image" ? (
                  <img
                    src={att.url}
                    alt={att.fileName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  getFileIcon(att.type)
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{att.fileName}</p>
                <p className="text-xs text-muted-foreground">ID: {att.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(att.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DialogTrigger>
          <EvidenceDetailView evidence={att} />
        </Dialog>
      ))}
    </div>
  );
}
// END OF components/case-view/evidence-manager-tab.tsx