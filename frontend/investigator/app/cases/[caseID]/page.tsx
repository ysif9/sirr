"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopNavBar from "@/components/top-nav-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CaseHeader from "@/components/case-view/case-header";
import InitialReportTab from "@/components/case-view/initial-report-tab";
import EvidenceManagerTab from "@/components/case-view/evidence-manager-tab";

import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { decryptReport } from "@/lib/crypto";
import type { ICaseInfo, IApiAttachment } from "@/lib/mock-data";
import { Loader2, AlertTriangle, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to transform API data to ICaseInfo
const transformApiDataToCaseInfo = (
  apiData: any,
  decryptedBody: any,
  attachmentKeys: { [key: string]: string }
): ICaseInfo => {
  // Dynamically get form keys from the report's associated data
  const formIdentifier = apiData.associated_data?.formIdentifier || {};
  const {
    reportTypeKey = "report_a_crime", // Fallback to a default for safety
    categoryKey = "theft_burglary_property_damage",
    formKey = "burglary_break_in",
  } = formIdentifier;

  return {
    caseId: apiData.id,
    priority: apiData.priority.charAt(0).toUpperCase() + apiData.priority.slice(1),
    status: apiData.status,
    crimeType: apiData.associated_data?.formTitle || "Unknown Report Type",
    location: decryptedBody?.location || "Location not found in report",
    submittedAt: apiData.created_at,
    assignedTo: "Current User", // This can be enhanced later
    reportedAt: apiData.created_at,
    reporter: { name: "Anonymous", isAnonymous: true, contact: "", credibilityScore: 0, reportingHistory: 0 },
    timeline: [], // Placeholder for future implementation

    // Decrypted and structured data
    attachments: apiData.attachments || [],
    attachmentKeys: attachmentKeys,
    formKey: { reportTypeKey, categoryKey, formKey },
    formData: decryptedBody || {},
  };
};

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseID as string;
  const { privateKey, isAuthenticated } = useAuth();
  const router = useRouter();

  const [caseData, setCaseData] = useState<ICaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!caseId || !privateKey) {
      setError("Missing case ID or private key.");
      setIsLoading(false);
      return;
    }

    const fetchAndDecryptCase = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/reports/${caseId}/`);
        const encryptedCase = response.data;

        const decryptionResult = decryptReport(
          privateKey,
          encryptedCase.key_envelope,
          encryptedCase.encrypted_body,
          encryptedCase.body_nonce
        );

        if (!decryptionResult) {
          throw new Error("Decryption failed. Please check your private key and the case data.");
        }
        
        const { reportBody, attachmentKeys } = decryptionResult;

        // Debugging log as requested
        console.log("DECRYPTED REPORT BODY:", reportBody);

        const formattedCaseData = transformApiDataToCaseInfo(encryptedCase, reportBody, attachmentKeys);
        setCaseData(formattedCaseData);
      } catch (err: any) {
        console.error("Failed to load or decrypt case:", err);
        if (err.response?.status === 404) {
          setError(`The case ID "${caseId}" does not match any records accessible to you.`);
        } else {
          setError(err.message || "An unexpected error occurred while loading the case.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDecryptCase();
  }, [caseId, privateKey, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <TopNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading and decrypting case...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div>
        <TopNavBar />
        <main className="p-4 md:p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Could Not Load Case</h1>
          <p className="text-muted-foreground mt-2">{error || `The case ID "${caseId}" does not match any records.`}</p>
          <Button onClick={() => router.push('/cases')} className="mt-6">Back to Cases</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNavBar />
      <CaseHeader caseData={caseData} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Tabs defaultValue="initial-report" className="w-full">
          <ScrollArea>
            <TabsList className="before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
              <TabsTrigger
                value="initial-report"
                className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
              >
                <FileText
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Initial Report
              </TabsTrigger>
              <TabsTrigger
                value="evidence-manager"
                className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
              >
                <Package
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Evidence Manager
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="initial-report" className="mt-6">
            <InitialReportTab caseData={caseData} />
          </TabsContent>

          <TabsContent value="evidence-manager" className="mt-6">
            <EvidenceManagerTab caseData={caseData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}