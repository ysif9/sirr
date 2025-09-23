"use client";

import { useParams } from "next/navigation";
import TopNavBar from "@/components/top-nav-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // NEW IMPORT for comp-436 style
import { mockCasesData } from "@/lib/mock-data";
import CaseHeader from "@/components/case-view/case-header";
import InitialReportTab from "@/components/case-view/initial-report-tab";
import InvestigationLogTab from "@/components/case-view/investigation-log-tab";
import EvidenceManagerTab from "@/components/case-view/evidence-manager-tab";
import EntitiesTab from "@/components/case-view/entities-tab";


export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseID as string;
  const caseData = mockCasesData.find((c) => c.caseId === caseId);

  if (!caseData) {
    return (
      <div>
        <TopNavBar />
        <main className="p-4 md:p-8">
          <h1 className="text-2xl font-bold">Case not found.</h1>
          <p>The case ID "{caseId}" does not match any records.</p>
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
          {/* START: comp-436 style TabsList integration */}
          <ScrollArea>
            <TabsList className="before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
              <TabsTrigger
                value="initial-report"
                className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
              >
                Initial Report
              </TabsTrigger>
              <TabsTrigger
                value="investigation-log"
                className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
              >
                Investigation Log
              </TabsTrigger>
              <TabsTrigger
                value="evidence-manager"
                className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
              >
                Evidence Manager
              </TabsTrigger>
              <TabsTrigger
                value="entities"
                className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
              >
                Entities
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {/* END: comp-436 style TabsList integration */}
          
          <TabsContent value="initial-report" className="mt-6">
            <InitialReportTab caseData={caseData} />
          </TabsContent>

          <TabsContent value="investigation-log" className="mt-6">
            <InvestigationLogTab caseData={caseData} />
          </TabsContent>
          
          <TabsContent value="evidence-manager" className="mt-6">
             <EvidenceManagerTab caseData={caseData} />
          </TabsContent>

          <TabsContent value="entities" className="mt-6">
             <EntitiesTab caseData={caseData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
// END OF app/cases/[caseID]/page.tsx