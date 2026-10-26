import type { HTMLAttributes } from "react";
import TailBadge from "@/components/ui/badge/Badge";
export function Badge({
  variant: _variant,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  void _variant;
  return (
    <span {...props} className={className}>
      <TailBadge color="primary" variant="light">
        {children}
      </TailBadge>
    </span>
  );
}
