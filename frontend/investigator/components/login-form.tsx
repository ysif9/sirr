"use client";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import Logo from "@/components/logo";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("testinv@sirr.com"); // Default to email
  const [password, setPassword] = useState("yoursecurepassword");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleLoginSuccess } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email.trim() || !privateKey.trim()) {
      setError("Email and Private Key are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.post("/token/", {
        email,
        password,
      });

      const { tfa_required, tfa_token } = response.data;

      if (tfa_required) {
        // 2FA is needed, store temporary token and redirect to OTP page
        sessionStorage.setItem("tfa_token", tfa_token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("privateKey", privateKey);
        router.push("/login/otp");
      } else {
        // This case should ideally not happen if 2FA is always enforced,
        // but handle it for completeness.
        handleLoginSuccess({ email, privateKey });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-10 items-center justify-center rounded-md">
                <Logo />
              </div>
              <span className="sr-only">Sirr.</span>
            </a>
            <h1 className="text-xl font-bold">Investigator Portal</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  required
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <div className="relative">
                <KeyRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Textarea
                  id="privateKey"
                  placeholder="Paste your Base64-encoded private key"
                  required
                  className="pl-9"
                  rows={3}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}