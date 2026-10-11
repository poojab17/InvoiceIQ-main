import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:scale-[1.02] shadow-lg",
        secondary:
          "bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white",
        danger:
          "bg-red-500 hover:bg-red-600 text-white",
        ghost:
          "hover:bg-white/5 text-zinc-300",
      },

      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5",
        lg: "h-12 px-8 text-lg",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export default function Button({
  className,
  variant,
  size,
  ...props
}) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        className
      )}
      {...props}
    />
  );
}