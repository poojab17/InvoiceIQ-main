import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";


export default function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
}) {

  const [showPassword, setShowPassword] = useState(false);


  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 10
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.3
      }}

      className="relative"

    >


      {/* Lock Icon */}

      <Lock
        size={18}
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-gray-500
        "
      />



      <input

        type={showPassword ? "text" : "password"}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        className="
          w-full
          bg-[#0F172A]
          border
          border-white/10
          rounded-xl
          py-3
          pl-12
          pr-12
          text-white
          placeholder-gray-500
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500/50
          focus:border-indigo-500
          transition-all
          duration-300
        "

      />



      {/* Toggle Password */}

      <motion.button

        type="button"

        onClick={() => setShowPassword(!showPassword)}

        whileHover={{
          scale: 1.1
        }}

        whileTap={{
          scale: 0.9
        }}

        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }

        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-gray-400
          hover:text-white
          transition
        "

      >

        {showPassword ? (

          <EyeOff size={18}/>

        ) : (

          <Eye size={18}/>

        )}

      </motion.button>


    </motion.div>

  );
}