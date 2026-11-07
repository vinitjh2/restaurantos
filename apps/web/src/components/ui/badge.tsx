import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive: "border-transparent bg-rose-50 text-rose-700 border-rose-200",
        outline: "text-slate-950 border-slate-200",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold",
        warning: "border-amber-200 bg-amber-50 text-amber-700 font-semibold",
        info: "border-blue-200 bg-blue-50 text-blue-700 font-semibold",
        purple: "border-purple-200 bg-purple-50 text-purple-700 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
