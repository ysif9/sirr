"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldAlert, GalleryVerticalEnd } from "lucide-react";
import apiClient from "@/lib/api";
import StepASetPassword from "@/components/onboarding/StepA-SetPassword";
import StepBEnroll2FA from "@/components/onboarding/StepB-Enroll2FA";
import StepCViewCredentials from "@/components/onboarding/StepC-ViewCredentials";
import { Card, CardContent } from "@/components/ui/card";

type OnboardingStep = "verifying" | "stepA" | "stepB" | "stepC" | "invalid";

interface VerificationData {
  email: string;
  username: string;
  expires_at: string;
}

interface TotpData {
  provisioning_uri: string;
  totp_secret: string;
}

interface AuthData {
  access: string;
  refresh: string;
}

export default function OnboardPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [step, setStep] = useState<OnboardingStep>("verifying");
  const [error, setError] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [totpData, setTotpData] = useState<TotpData | null>(null);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No onboarding token provided.");
      setStep("invalid");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient.get(`/users/onboarding/verify/${token}/`);
        setVerificationData(response.data);
        setStep("stepA");
      } catch (err: any) {
        if (err.response?.status === 410 || err.response?.status === 404) {
          setError("This invitation link is invalid or has expired. Please contact your administrator for a new one.");
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
        console.error("Token verification failed:", err);
        setStep("invalid");
      }
    };

    verifyToken();
  }, [token]);

  const handleStepASuccess = (data: TotpData, generatedKeyPair: { publicKey: string; privateKey: string }) => {
    setTotpData(data);
    setKeyPair(generatedKeyPair);
    setStep("stepB");
  };

  const handleStepBSuccess = (data: AuthData) => {
    setAuthData(data);
    setStep("stepC");
  };

  const handleOnboardingComplete = () => {
    if (!authData || !keyPair || !verificationData) return;

    localStorage.setItem("authToken", authData.access);
    localStorage.setItem("privateKey", keyPair.privateKey);
    localStorage.setItem("username", verificationData.username);
    
    router.push("/login");
  };

  const renderContent = () => {
    switch (step) {
      case "verifying":
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying invitation...</p>
          </div>
        );
      case "invalid":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Invalid or Expired Link</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        );
      case "stepA":
        return <StepASetPassword token={token} onComplete={handleStepASuccess} expiresAt={verificationData?.expires_at} />;
      case "stepB":
        return <StepBEnroll2FA token={token} totpData={totpData!} onComplete={handleStepBSuccess} />;
      case "stepC":
        return <StepCViewCredentials privateKey={keyPair!.privateKey} onComplete={handleOnboardingComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col items-center gap-2 mb-4">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Sirr.</span>
          </a>
          <h1 className="text-xl font-bold">Investigator Account Setup</h1>
        </div>
      <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
      </Card>
    </div>
  );
}