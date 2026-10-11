import { useEffect, useRef, useState } from "react";

import {
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function UserMenu() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          flex items-center gap-3
          rounded-xl
          border border-white/[0.07]
          bg-white/[0.025]
          px-2 py-1.5
          transition
          hover:bg-white/[0.05]
        "
      >
        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            bg-indigo-500/15
            text-sm font-semibold
            text-indigo-300
          "
        >
          {initials}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-32 truncate text-sm font-medium text-gray-200">
            {user?.name || "User"}
          </p>

          <p className="max-w-32 truncate text-[11px] text-gray-500">
            {user?.email || ""}
          </p>
        </div>

        <ChevronDown
          size={15}
          className={`
            hidden text-gray-500
            transition-transform
            sm:block
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute right-0 top-[calc(100%+10px)]
            z-50 w-64
            overflow-hidden
            rounded-2xl
            border border-white/[0.08]
            bg-[#111827]
            shadow-2xl
            shadow-black/40
          "
        >
          <div className="border-b border-white/[0.07] p-4">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "InvoiceIQ User"}
            </p>

            <p className="mt-1 truncate text-xs text-gray-500">
              {user?.email || ""}
            </p>
          </div>

          <div className="p-2">
            <button
              type="button"
              disabled
              className="
                flex w-full items-center
                gap-3 rounded-lg
                px-3 py-2.5
                text-sm text-gray-600
                cursor-not-allowed
              "
            >
              <UserRound size={17} />
              Profile

              <span className="ml-auto text-[10px]">
                Soon
              </span>
            </button>

            <button
              type="button"
              disabled
              className="
                flex w-full items-center
                gap-3 rounded-lg
                px-3 py-2.5
                text-sm text-gray-600
                cursor-not-allowed
              "
            >
              <Settings size={17} />
              Settings

              <span className="ml-auto text-[10px]">
                Soon
              </span>
            </button>
          </div>

          <div className="border-t border-white/[0.07] p-2">
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="
                flex w-full items-center
                gap-3 rounded-lg
                px-3 py-2.5
                text-sm text-red-400
                transition
                hover:bg-red-500/10
              "
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}