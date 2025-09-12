"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { OTPInput, SlotProps } from "input-otp";
import { MinusIcon, GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MOCK_OTP = "123456";

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (otp === MOCK_OTP) {
      console.log("OTP verification successful, redirecting to home...");
      router.push('/home');
    } else {
      setError("Invalid OTP. Please try again.");
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
            <h1 className="text-xl font-bold">Enter OTP</h1>
            <p className="text-muted-foreground text-center text-sm">
              A 6-digit code has been sent to your email. (Hint: {MOCK_OTP})
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
          
          <Button type="submit" className="w-full">
            Verify OTP
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