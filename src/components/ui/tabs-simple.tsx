import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  className,
  children,
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  // Clone children and inject the active state
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TabsContent) {
        return React.cloneElement(
          child as React.ReactElement<TabsContentProps>,
          {
            active: (child.props as TabsContentProps).value === activeTab,
          }
        );
      }
      if (child.type === TabsList) {
        return React.cloneElement(child as React.ReactElement<TabsListProps>, {
          activeTab,
          setActiveTab,
        });
      }
    }
    return child;
  });

  return (
    <div className={cn("w-full", className)} {...props}>
      {childrenWithProps}
    </div>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string;
  setActiveTab?: (value: string) => void;
  children: React.ReactNode;
}

export function TabsList({
  className,
  activeTab,
  setActiveTab,
  children,
  ...props
}: TabsListProps) {
  // Clone children and inject the click handler
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
        active: (child.props as TabsTriggerProps).value === activeTab,
        onClick: () => setActiveTab?.((child.props as TabsTriggerProps).value),
      });
    }
    return child;
  });

  return (
    <div
      className={cn(
        "flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {childrenWithProps}
    </div>
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
}

export function TabsTrigger({
  value,
  active,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  active?: boolean;
}

export function TabsContent({
  value,
  active,
  className,
  children,
  ...props
}: TabsContentProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
