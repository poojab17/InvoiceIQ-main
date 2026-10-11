import { motion } from "framer-motion";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";


export default function Login(){

  return (

    <AuthLayout>

      <motion.div

        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}

        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}

        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-8
        "
      >


        <motion.div

          className="mb-8"

          initial={{
            opacity: 0,
            x: -20
          }}

          animate={{
            opacity: 1,
            x: 0
          }}

          transition={{
            delay: 0.2
          }}

        >

          <h1 className="text-3xl font-bold text-white">
            Access Your Workspace
          </h1>


          <p className="mt-2 text-sm text-gray-400">
            Login to your InvoiceIQ account
          </p>


        </motion.div>



        <motion.div

          initial={{
            opacity:0
          }}

          animate={{
            opacity:1
          }}

          transition={{
            delay:0.3
          }}

        >

          <LoginForm />

        </motion.div>




        <motion.p

          className="mt-6 text-center text-sm text-gray-400"

          initial={{
            opacity:0
          }}

          animate={{
            opacity:1
          }}

          transition={{
            delay:0.4
          }}

        >

          Don't have an account?{" "}


          <motion.a

            href="/register"

            whileHover={{
              scale:1.05
            }}

            whileTap={{
              scale:0.95
            }}

            className="
              inline-block
              text-indigo-400
              hover:text-indigo-300
            "

          >

            Create Account

          </motion.a>


        </motion.p>



      </motion.div>


    </AuthLayout>

  );

}