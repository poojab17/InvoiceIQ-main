import {
  Bell,
  Search,
  UserCircle2,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2">
        <Search
          size={18}
          className="text-zinc-400"
        />

        <input
          type="text"
          placeholder="Search invoices..."
          className="bg-transparent text-sm outline-none placeholder:text-zinc-500"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="rounded-xl border border-white/10 bg-zinc-900 p-3 hover:bg-zinc-800 transition">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2">
          <UserCircle2
            size={32}
            className="text-cyan-400"
          />

          <div>
            <h3 className="font-medium">
              Saurabh
            </h3>

            <p className="text-xs text-zinc-400">
              Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}