import {
  LayoutDashboard,
  UploadCloud,
  ReceiptText,
  BarChart3,
  Sparkles,
  Settings,
  X,
  BrainCircuit,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Upload",
    path: "/upload",
    icon: UploadCloud,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: ReceiptText,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Insights",
    path: "/ai-insights",
    icon: Sparkles,
  },
];

export default function Sidebar({
  open,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-black/60 backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-white/[0.07]
          bg-[#0B1120]
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div
          className="
            flex h-[72px]
            items-center justify-between
            border-b border-white/[0.07]
            px-5
          "
        >
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-indigo-500/20
                bg-indigo-500/10
              "
            >
              <BrainCircuit
                size={23}
                className="text-indigo-400"
              />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                InvoiceIQ
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Intelligence
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="
              rounded-lg p-2
              text-gray-400
              hover:bg-white/5
              hover:text-white
              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4">
          <p
            className="
              mb-3 px-3
              text-[11px]
              font-semibold uppercase
              tracking-[0.16em]
              text-gray-600
            "
          >
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                    group flex items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-200

                    ${
                      isActive
                        ? `
                          bg-indigo-500/10
                          text-indigo-300
                          ring-1 ring-inset
                          ring-indigo-500/15
                        `
                        : `
                          text-gray-400
                          hover:bg-white/[0.04]
                          hover:text-gray-100
                        `
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={
                        isActive
                          ? "text-indigo-400"
                          : "text-gray-500 transition group-hover:text-gray-300"
                      }
                    />

                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-white/[0.07] p-4">
          <button
            type="button"
            disabled
            className="
              flex w-full items-center
              justify-between
              rounded-xl px-3 py-2.5
              text-sm text-gray-600
              cursor-not-allowed
            "
          >
            <span className="flex items-center gap-3">
              <Settings size={19} />
              Settings
            </span>

            <span
              className="
                rounded-full
                border border-white/10
                bg-white/5
                px-2 py-0.5
                text-[9px]
                font-semibold uppercase
                tracking-wide
                text-gray-500
              "
            >
              Soon
            </span>
          </button>

          <div
            className="
              mt-4 rounded-xl
              border border-white/[0.06]
              bg-white/[0.025]
              p-3
            "
          >
            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-purple-400"
              />

              <p className="text-xs font-medium text-gray-300">
                AI Engine
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-[11px] text-gray-500">
                Invoice processing enabled
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}