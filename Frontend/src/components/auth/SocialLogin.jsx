import { Globe } from "lucide-react";

export default function SocialLogin() {
  return (
    <div className="space-y-5">

      {/* Divider */}

      <div className="flex items-center gap-4">

        <div className="flex-1 h-px bg-gray-700" />

        <span className="text-gray-400 text-sm">
          OR
        </span>

        <div className="flex-1 h-px bg-gray-700" />

      </div>

      {/* Google Button */}

      <button
        type="button"
        className="
          w-full
          flex
          items-center
          justify-center
          gap-3
          bg-[#0F172A]
          border
          border-gray-700
          hover:border-blue-500
          hover:bg-[#162033]
          py-3
          rounded-xl
          text-white
          transition
          duration-300
        "
      ><Globe size={20} className="text-blue-400" />

        Continue with Google

      </button>

    </div>
  );
}