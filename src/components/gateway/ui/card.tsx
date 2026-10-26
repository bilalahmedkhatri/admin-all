import type { HTMLAttributes } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { cn } from "@/utils";
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <ComponentCard {...props} unstyledContent className={className}>{props.children}</ComponentCard>;
}
export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("p-5 sm:p-6", className)} />;
}
export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      {...props}
      className={cn(
        "border-b border-gray-100 px-5 py-5 sm:px-6 dark:border-gray-800",
        className,
      )}
    />
  );
}
export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={cn(
        "text-base font-medium text-gray-800 dark:text-white/90",
        className,
      )}
    />
  );
}
