import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

const getVariantClasses = (variant: string = "default"): string => {
  switch (variant) {
    case "destructive":
      return "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90";
    case "outline":
      return "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
    case "ghost":
      return "hover:bg-accent hover:text-accent-foreground";
    case "link":
      return "text-primary underline-offset-4 hover:underline";
    default:
      return "bg-primary text-primary-foreground shadow hover:bg-primary/90";
  }
};

const getSizeClasses = (size: string = "default"): string => {
  switch (size) {
    case "sm":
      return "h-8 rounded-md px-3 text-xs";
    case "lg":
      return "h-10 rounded-md px-8";
    case "icon":
      return "h-9 w-9";
    default:
      return "h-9 px-4 py-2";
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          getVariantClasses(variant),
          getSizeClasses(size),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
