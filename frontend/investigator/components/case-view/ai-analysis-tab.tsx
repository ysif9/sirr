"use client";

import type { IAIAnalysis } from "@/lib/mock-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, ShieldAlert, Zap } from "lucide-react";

interface AiAnalysisTabProps {
  analysis: IAIAnalysis | null;
}

const InfoBlock = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
    <div className="mt-1 text-base">{value}</div>
  </div>
);

const ReasoningBlock = ({ title, content }: { title: string; content: string }) => (
  <div className="mt-4">
    <h4 className="font-semibold">{title}</h4>
    <p className="mt-2 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap font-mono">
      {content || "No reasoning provided."}
    </p>
  </div>
);

export default function AiAnalysisTab({ analysis }: AiAnalysisTabProps) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center text-center mt-12 py-8 border-2 border-dashed rounded-lg">
        <BrainCircuit className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">AI Analysis Pending</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The automated analysis for this case has not been completed yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Please check back later.
        </p>
      </div>
    );
  }

  // Basic validation to prevent crashes if the object is malformed.
  if (typeof analysis.is_spam === 'undefined' || typeof analysis.urgency === 'undefined') {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Analysis Data Error</AlertTitle>
        <AlertDescription>
          The AI analysis data is present but appears to be malformed or incomplete. Please report this issue.
        </AlertDescription>
      </Alert>
    );
  }

  const urgencyVariantMap: { [key: string]: "destructive" | "secondary" | "outline" | "default" } = {
    critical: "destructive",
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };
  const urgencyVariant = urgencyVariantMap[analysis.urgency] || "default";
  
  const spamVariant = analysis.is_spam ? "destructive" : "default";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoBlock
          label="Urgency"
          value={<Badge variant={urgencyVariant} className="capitalize text-base px-3 py-1">{analysis.urgency}</Badge>}
        />
        <InfoBlock
          label="Spam Detection"
          value={<Badge variant={spamVariant} className="text-base px-3 py-1">{analysis.is_spam ? "Spam" : "Not Spam"}</Badge>}
        />
        <InfoBlock
          label="Spam Confidence"
          value={`${analysis.confidence}%`}
        />
      </div>

      <div className="border-t pt-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Analysis Details
        </h3>
        <ReasoningBlock title="Urgency Reasoning" content={analysis.urgency_reasoning} />
        <ReasoningBlock title="Spam Reasoning" content={analysis.spam_reasoning} />
      </div>

      <div className="border-t pt-4 text-right text-xs text-muted-foreground">
        <p>Analyzed at: {new Date(analysis.analyzed_at).toLocaleString()}</p>
        <p>Model Version: {analysis.model_version}</p>
      </div>
    </div>
  );
}