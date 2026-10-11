import { motion } from "framer-motion";
import {
  ScanLine,
  FileSearch,
  Brain,
  ShieldCheck,
  CheckCircle
} from "lucide-react";


const steps = [
  {
    title: "Document Scanning",
    desc: "Reading invoice structure",
    icon: ScanLine,
  },
  {
    title: "OCR Processing",
    desc: "Extracting text information",
    icon: FileSearch,
  },
  {
    title: "AI Entity Extraction",
    desc: "Understanding invoice fields",
    icon: Brain,
  },
  {
    title: "Validation",
    desc: "Checking accuracy",
    icon: ShieldCheck,
  }
];


export default function AIProcessing() {

  return (
    <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800">

      <h2 className="text-xl font-semibold text-white mb-6">
        AI Processing Engine
      </h2>


      <div className="space-y-5">

        {steps.map((step,index)=>{

          const Icon = step.icon;


          return (
            <motion.div
              key={index}
              initial={{opacity:0,x:-20}}
              animate={{opacity:1,x:0}}
              transition={{
                delay:index*0.3
              }}

              className="flex items-center gap-4"
            >


              <div className="
                w-12 h-12 
                rounded-xl
                bg-blue-500/10
                flex
                items-center
                justify-center
                text-blue-400
              ">

                <Icon size={22}/>

              </div>



              <div className="flex-1">

                <h3 className="text-white font-medium">
                  {step.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {step.desc}
                </p>


                <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">

                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{
                      width:"0%"
                    }}
                    animate={{
                      width:"100%"
                    }}
                    transition={{
                      duration:2,
                      delay:index*0.5
                    }}
                  />

                </div>


              </div>



              <CheckCircle 
                className="text-green-400"
                size={22}
              />


            </motion.div>
          )

        })}


      </div>


    </div>
  )
}