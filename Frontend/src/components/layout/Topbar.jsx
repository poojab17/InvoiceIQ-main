import {
  useState,
} from "react";

import {
  Menu,
  Search,
  Command,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import UserMenu from "./UserMenu";


export default function Topbar({
  onOpenSidebar,
}) {
  const navigate =
    useNavigate();

  const [search, setSearch] =
    useState("");


  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const query =
      search.trim();

    if (!query) {
      navigate("/invoices");
      return;
    }

    navigate(
      `/invoices?q=${encodeURIComponent(
        query
      )}`
    );
  };


  return (
    <header
      className="
        sticky
        top-0
        z-30
        h-[72px]
        border-b
        border-white/[0.07]
        bg-[#080D18]/90
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          h-full
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-3
          "
        >

          <button
            type="button"
            onClick={
              onOpenSidebar
            }
            aria-label="Open navigation"
            className="
              rounded-xl
              border
              border-white/[0.07]
              p-2.5
              text-gray-400
              transition
              hover:bg-white/5
              hover:text-white
              lg:hidden
            "
          >
            <Menu size={20} />
          </button>


          <form
            onSubmit={
              handleSubmit
            }
            className="
              relative
              hidden
              w-full
              max-w-md
              md:block
            "
          >

            <Search
              size={17}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-gray-600
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label="Global invoice search"
              placeholder="Search invoices..."
              className="
                h-10
                w-full
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                pl-10
                pr-14
                text-sm
                text-gray-200
                outline-none
                transition
                placeholder:text-gray-600
                focus:border-indigo-500/40
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                hidden
                -translate-y-1/2
                items-center
                gap-1
                rounded-md
                border
                border-white/[0.08]
                px-1.5
                py-1
                text-[10px]
                text-gray-600
                lg:flex
              "
            >
              <Command size={10} />
              K
            </div>

          </form>

        </div>


        <UserMenu />

      </div>

    </header>
  );
}