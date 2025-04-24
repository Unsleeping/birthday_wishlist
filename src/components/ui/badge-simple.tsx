import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
}

const getVariantClasses = (variant: string = "default"): string => {
  switch (variant) {
    case "secondary":
      return "bg-secondary text-secondary-foreground";
    case "destructive":
      return "bg-destructive text-destructive-foreground";
    case "outline":
      return "text-foreground border border-input";
    default:
      return "bg-primary text-primary-foreground";
  }
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          getVariantClasses(variant),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
