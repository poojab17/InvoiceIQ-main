import { NavLink } from "react-router-dom";

export default function SidebarItem({
  to,
  icon: Icon,
  label,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/20"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={20} />

      <span className="font-medium">
        {label}
      </span>
    </NavLink>
  );
}