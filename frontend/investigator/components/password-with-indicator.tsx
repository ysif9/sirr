"use client";

import {
  useId,
  useMemo,
  useState,
  ChangeEvent,
  InputHTMLAttributes,
} from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordWithIndicatorProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordWithIndicator({
  label,
  value,
  onChange,
  id: propId,
  ...props
}: PasswordWithIndicatorProps) {
  const id = useId();
  const inputId = propId || id;
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    // New simplified strength rules based primarily on length (min 15 chars)
    const length = pass.length;

    // Define length requirements for scoring
    const requirements = [
      { length: 15, text: "At least 15 characters" },
      { length: 20, text: "More than 20 characters" },
      { length: 25, text: "More than 25 characters" },
    ];

    let score = 0;
    
    // Score 1: Basic entry (length > 0)
    if (length > 0) score = 1;
    
    // Score 2: Meets minimum security requirement (15+ chars)
    if (length >= requirements[0].length) score = 2;
    
    // Score 3: Good passphrase length (20+ chars)
    if (length >= requirements[1].length) score = 3;
    
    // Score 4: Excellent passphrase length (25+ chars)
    if (length >= requirements[2].length) score = 4;
    
    // Map requirements to met/unmet status
    const metRequirements = [
      { met: length >= requirements[0].length, text: requirements[0].text },
      { met: length >= requirements[1].length, text: requirements[1].text },
      { met: length >= requirements[2].length, text: requirements[2].text },
      // Always met check to allow spaces and printable ASCII
      { met: true, text: "Spaces and special characters allowed" },
    ];

    return { score, metRequirements };
  };

  const { score: strengthScore, metRequirements } = useMemo(() => checkStrength(value), [value]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (value.length === 0) return "Enter a passphrase";
    if (score <= 1) return "Too Short (Min 15 recommended)";
    if (score === 2) return "Good length";
    if (score === 3) return "Strong length";
    return "Excellent passphrase";
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <Input
          id={inputId}
          className="pe-9"
          placeholder="Enter new passphrase (Min 15 characters)"
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          aria-describedby={`${inputId}-description`}
          {...props}
        />
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls={inputId}
          disabled={props.disabled}
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        className="bg-border mt-1.5 mb-2 h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        <div
          className={`h-full ${getStrengthColor(
            strengthScore
          )} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        ></div>
      </div>

      <p
        id={`${inputId}-description`}
        className="text-foreground mb-2 text-sm font-medium"
      >
        {getStrengthText(strengthScore)}. Recommendations:
      </p>

      <ul className="space-y-1.5" aria-label="Password requirements">
        {metRequirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon
                size={16}
                className="text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <XIcon
                size={16}
                className="text-muted-foreground/80"
                aria-hidden="true"
              />
            )}
            <span
              className={`text-xs ${
                req.met ? "text-emerald-600" : "text-muted-foreground"
              }`}
            >
              {req.text}
              <span className="sr-only">
                {req.met ? " - Requirement met" : " - Requirement not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}