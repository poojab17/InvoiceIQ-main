import { cn } from "../../utils/cn"; // optional, currently unused

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}