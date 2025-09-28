"use client"

import { FormEvent, useState, useEffect }
from "react";
import { useRouter } from "next/navigation";
import { OTPInput, SlotProps } from "input-otp";
import { MinusIcon, GalleryVerticalEnd } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function OtpPage() {
  const router = useRouter();
  const { handleLoginSuccess } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if there's no temporary token, meaning the user didn't complete the first login step.
    if (!sessionStorage.getItem("tfa_token")) {
      router.replace('/login');
    }
  }, [router]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const tfaToken = sessionStorage.getItem("tfa_token");
    const email = sessionStorage.getItem("email");
    const privateKey = sessionStorage.getItem("privateKey");

    if (!tfaToken || !email || !privateKey) {
        setError("Login session expired. Please log in again.");
        setIsSubmitting(false);
        setTimeout(() => router.replace('/login'), 2000);
        return;
    }

    try {
        await apiClient.post('/token/verify-totp/', {
            tfa_token: tfaToken,
            totp_code: otp,
        });

        // On success, finalize the login. The server has set HttpOnly cookies.
        handleLoginSuccess({ email, privateKey });

        // Clean up temporary session storage
        sessionStorage.removeItem("tfa_token");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("privateKey");

    } catch (err: any) {
        setError(err.response?.data?.detail || "Invalid OTP code. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Sirr.</span>
            </a>
            <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
            <p className="text-muted-foreground text-center text-sm">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
              <OTPInput
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                containerClassName="flex items-center gap-3 has-disabled:opacity-50"
                render={({ slots }) => (
                  <>
                    <div className="flex">
                      {slots.slice(0, 3).map((slot, idx) => (
                        <Slot key={idx} {...slot} />
                      ))}
                    </div>
                    <div className="text-muted-foreground/80">
                      <MinusIcon size={16} aria-hidden="true" />
                    </div>
                    <div className="flex">
                      {slots.slice(3).map((slot, idx) => (
                        <Slot key={idx} {...slot} />
                      ))}
                    </div>
                  </>
                )}
              />
          </div>
          
          {error && <p className="text-destructive text-center text-sm">{error}</p>}
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Re-using the Slot component styling from the original components/otp.tsx
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground relative -ms-px flex size-9 items-center justify-center border font-medium shadow-xs transition-[color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}