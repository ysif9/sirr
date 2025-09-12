"use client"
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react"; // Added Eye, EyeOff for password toggle
import { useState } from "react"; // Added useState for password visibility state

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              {/* This span is for screen readers and isn't visible.
                  The main visible title is below in the h1 tag. */}
              <span className="sr-only">Sirr.</span> 
            </a>
            <h1 className="text-xl font-bold">Welcome to Sirr.</h1> {/* Changed title */}
            {/* Removed: Don't have an account? Sign up link */}
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3"> {/* Added password field */}
              <Label htmlFor="password">Password</Label>
              <div className="relative"> {/* Wrapper for Input and toggle icon */}
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // Toggle type based on state
                  placeholder="********"
                  required
                  className="pr-10" // Add padding to the right for the toggle icon
                />
                <Button
                  type="button" // Important: prevent form submission when clicking the toggle
                  variant="ghost" // Style as a subtle button
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" // Position the button
                  onClick={() => setShowPassword((prev) => !prev)} // Toggle password visibility
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" aria-hidden="true" /> // Eye icon when password is shown
                  ) : (
                    <EyeOff className="h-4 w-4" aria-hidden="true" /> // EyeOff icon when password is hidden
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Login
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