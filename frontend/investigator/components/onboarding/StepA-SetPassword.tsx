"use client";

import { useState, FormEvent } from "react";
import nacl from "tweetnacl";
import { encodeBase64 } from "tweetnacl-util";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";
import apiClient from "@/lib/api";
import PasswordStrength from "./PasswordStrength";

interface StepAProps {
  token: string;
  expiresAt?: string;
  onComplete: (data: any, keyPair: { publicKey: string; privateKey: string }) => void;
}

export default function StepASetPassword({ token, expiresAt, onComplete }: StepAProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formattedExpiresAt = expiresAt ? new Date(expiresAt).toLocaleString() : '...';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Generate X25519 key pair
      const keyPair = nacl.box.keyPair();
      const publicKeyB64 = encodeBase64(keyPair.publicKey);
      const privateKeyB64 = encodeBase64(keyPair.secretKey);
      
      // Backend expects a specific bundle structure with a Kyber placeholder
      const kyberPlaceholder = Buffer.from(new Uint8Array(1568)).toString('base64');
      const public_key_bundle = {
        identity_key_x25519: publicKeyB64,
        kem_key_kyber: kyberPlaceholder,
      };

      // 2. POST to the backend
      const response = await apiClient.post("/users/onboarding/complete-step-1/", {
        token,
        password,
        public_key_bundle,
      });

      // 3. On success, call the onComplete callback
      onComplete(response.data, { publicKey: publicKeyB64, privateKey: privateKeyB64 });

    } catch (err: any) {
      console.error("Step 1 completion failed:", err);
      const apiError = err.response?.data?.password_errors?.[0] || err.response?.data?.error || "An unexpected error occurred.";
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Step 1: Set Your Password</h3>
        <p className="text-sm text-muted-foreground">Choose a strong password to secure your account. This will also be used to generate your unique encryption keys.</p>
        <Alert variant="default" className="text-left text-sm">
            <Info className="h-4 w-4" />
            <AlertTitle>Invitation Details</AlertTitle>
            <AlertDescription>
              This invitation is valid until {formattedExpiresAt}.
            </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <PasswordStrength password={password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Set Password and Continue
      </Button>
    </form>
  );
}