import { FileSearch } from "lucide-react";

export default function EmptyState({
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center">
      <FileSearch
        size={60}
        className="text-zinc-500"
      />

      <h2 className="mt-6 text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-zinc-400">
        {description}
      </p>
    </div>
  );
}