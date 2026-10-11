import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        success:
          "bg-green-500/15 text-green-400",

        warning:
          "bg-yellow-500/15 text-yellow-400",

        danger:
          "bg-red-500/15 text-red-400",

        info:
          "bg-cyan-500/15 text-cyan-400",
      },
    },

    defaultVariants: {
      variant: "info",
    },
  }
);

export default function Badge({
  className,
  variant,
  children,
}) {
  return (
    <span
      className={cn(
        badgeVariants({ variant }),
        className
      )}
    >
      {children}
    </span>
  );
}