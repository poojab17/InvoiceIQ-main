import { motion } from "framer-motion";
import invoiceIQLogo from "../../assets/invoiceiq-logo.png";
export default function AuthLayout({ children }) {

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-[#050505]
        text-white
        flex
        overflow-hidden
      "
    >

      {/* Left Branding Section */}
      <div
        className="
          hidden
          lg:flex
          w-1/2
          relative
          flex-col
          justify-center
          px-16
        "
      >

        {/* Glow */}
        <div
          className="
            absolute
            top-20
            left-20
            w-96
            h-96
            bg-indigo-600/20
            blur-[120px]
            rounded-full
          "
        />


        <motion.div

          initial={{
            opacity:0,
            x:-40
          }}

          animate={{
            opacity:1,
            x:0
          }}

          transition={{
            duration:0.6
          }}

          className="relative z-10"

        >

         <div>

  <img
  src={invoiceIQLogo}
  alt="InvoiceIQ"
  className="
    w-[400px]
    h-auto
    object-contain
  "
/>

</div>


          <h2
            className="
              mt-6
              text-3xl
              font-semibold
              text-white
            "
          >
            AI Powered Document Intelligence
          </h2>


          <p
            className="
              mt-4
              text-gray-400
              max-w-lg
              text-lg
            "
          >
            Transform invoices into actionable business insights
            using advanced AI automation.
          </p>



          {/* Features */}

          <div className="mt-10 space-y-5">


            <Feature text="AI Invoice Analysis" />


            <Feature text="Smart Data Extraction" />


            <Feature text="Business Intelligence Dashboard" />


          </div>


        </motion.div>


      </div>





      {/* Right Auth Section */}

      <div
        className="
          w-full
          lg:w-1/2
          flex
          items-center
          justify-center
          px-6
          relative
        "
      >


        {/* Right glow */}

        <div
          className="
            absolute
            bottom-20
            right-20
            w-72
            h-72
            bg-purple-600/20
            blur-[100px]
            rounded-full
          "
        />


        <motion.div

          initial={{
            opacity:0,
            x:40
          }}

          animate={{
            opacity:1,
            x:0
          }}

          transition={{
            duration:0.6
          }}

          className="relative z-10 w-full"

        >

          {children}

        </motion.div>


      </div>


    </div>

  );

}



function Feature({text}) {

  return (

    <div
      className="
        flex
        items-center
        gap-3
        text-gray-300
      "
    >

      <div
        className="
          h-2
          w-2
          rounded-full
          bg-indigo-400
        "
      />

      <span>
        {text}
      </span>

    </div>

  );

}