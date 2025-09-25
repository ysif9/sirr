"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Copy, Check, ShieldCheck, KeyRound, ArrowRight } from "lucide-react";

interface AuthData {
  recovery_codes: string[];
}

interface StepCProps {
  authData: AuthData;
  privateKey: string;
  onComplete: () => void;
}

export default function StepCViewCredentials({ authData, privateKey, onComplete }: StepCProps) {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleCopy = (text: string, type: 'key' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const recoveryCodesText = authData.recovery_codes.join("\n");

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Step 3: Save Your Credentials</h3>
        <p className="text-sm text-muted-foreground">Your account is created. Save these credentials in a secure place. You will not be able to see them again.</p>
      </div>

      <Alert variant="destructive">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Critical: Save these credentials now!</AlertTitle>
        <AlertDescription>
          If you lose your password, private key, or authenticator app, you will need these to recover your account. Without them, access will be permanently lost.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Private Encryption Key</Label>
            <div className="relative">
                <textarea
                    readOnly
                    value={privateKey}
                    className="w-full p-2 border rounded-md bg-muted font-mono text-xs h-24 resize-none pr-10"
                />
                <Button variant="ghost" size="icon" onClick={() => handleCopy(privateKey, 'key')} className="absolute top-1 right-1 h-8 w-8">
                    {copiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>

        <div className="space-y-2">
            <Label>Recovery Codes</Label>
            <div className="relative">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 border rounded-md bg-muted font-mono text-sm">
                {authData.recovery_codes.map(code => <span key={code}>{code}</span>)}
                </div>
                 <Button variant="ghost" size="icon" onClick={() => handleCopy(recoveryCodesText, 'codes')} className="absolute top-1 right-1 h-8 w-8">
                    {copiedCodes ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Checkbox id="acknowledgement" checked={isAcknowledged} onCheckedChange={(checked) => setIsAcknowledged(checked as boolean)} />
        <Label htmlFor="acknowledgement" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I have securely saved my Private Key and Recovery Codes.
        </Label>
      </div>

      <Button onClick={onComplete} disabled={!isAcknowledged} className="w-full">
        Proceed to Investigator Portal <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}