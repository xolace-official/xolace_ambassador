import { ReactNode } from "react";

export function Drawer({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) {
  // Simple placeholder: just render children
  return <>{children}</>;
}

export function DrawerTrigger({ asChild = false, children }: { asChild?: boolean; children: ReactNode }) {
  // In real shadcn/ui, asChild clones the child. Here we just render it.
  return <>{children}</>;
}

export function DrawerContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
