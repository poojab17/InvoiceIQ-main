import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function UploadHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8 shadow-xl"
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative flex items-center gap-4">
        <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
          <Sparkles size={34} className="text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Upload Invoice
          </h1>

          <p className="mt-2 max-w-2xl text-cyan-100">
            Upload PDF or image invoices and let InvoiceIQ extract
            structured information using OCR and AI-powered document
            intelligence.
          </p>
        </div>
      </div>
    </motion.div>
  );
}