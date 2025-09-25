import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength = ({ password = "" }: PasswordStrengthProps) => {
  const getStrength = () => {
    const length = password.length;
    if (length === 0) return { score: 0, label: "", color: "" };
    if (length < 8) return { score: 1, label: "Too Short", color: "bg-destructive" };
    if (length < 12) return { score: 2, label: "Weak", color: "bg-destructive" };
    if (length < 16) return { score: 3, label: "Good", color: "bg-yellow-500" };
    return { score: 4, label: "Strong", color: "bg-green-500" };
  };

  const { score, label, color } = getStrength();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <div className={cn("h-2 rounded-full", score >= 1 ? color : "bg-muted")} />
        <div className={cn("h-2 rounded-full", score >= 2 ? color : "bg-muted")} />
        <div className={cn("h-2 rounded-full", score >= 3 ? color : "bg-muted")} />
        <div className={cn("h-2 rounded-full", score >= 4 ? color : "bg-muted")} />
      </div>
      {label && <p className="text-xs font-medium text-right">{label}</p>}
    </div>
  );
};

export default PasswordStrength;