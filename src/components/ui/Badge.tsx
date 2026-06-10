import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "blue" | "yellow" | "gray" | "red";
  className?: string;
}

const variants = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-700",
  red: "bg-red-100 text-red-800",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
