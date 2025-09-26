"use client";

import { useState, FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check } from "lucide-react";
import apiClient from "@/lib/api";

interface TotpData {
  provisioning_uri: string;
  totp_secret: string;
}

interface StepBProps {
  token: string;
  totpData: TotpData;
  onComplete: (data: any) => void;
}

export default function StepBEnroll2FA({ token, totpData, onComplete }: StepBProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(totpData.totp_secret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post("/users/onboarding/complete-step-2/", {
        token,
        totp_code: otp,
      });
      onComplete(response.data);
    } catch (err: any) {
      console.error("Step 2 completion failed:", err);
      const apiError = err.response?.data?.error || "An unexpected error occurred.";
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Step 2: Set Up Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">Scan the QR code with an authenticator app (e.g., Google Authenticator, Authy) or enter the secret key manually.</p>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="p-4 bg-white rounded-lg border">
          <QRCodeSVG value={totpData.provisioning_uri} size={160} />
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <p className="text-sm font-medium">Can't scan the code?</p>
          <p className="text-xs text-muted-foreground">Enter this secret key into your authenticator app manually.</p>
          <div className="relative flex items-center justify-center md:justify-start">
            <code className="p-2 border rounded-md bg-muted text-lg tracking-widest font-mono">
              {totpData.totp_secret}
            </code>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="ml-2">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="otp">Enter 6-Digit Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={isSubmitting}
              className="text-center text-2xl tracking-[0.3em]"
            />
        </div>
        
        {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify and Complete Setup
        </Button>
      </form>
    </div>
  );
}