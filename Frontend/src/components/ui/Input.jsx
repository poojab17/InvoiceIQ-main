import { cn } from "../../utils/cn";

export default function Input({
  className,
  ...props
}) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-cyan-400",
        className
      )}
      {...props}
    />
  );
}