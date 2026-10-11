import { Upload } from "lucide-react";
import Button from "../ui/Button";
import { motion } from "framer-motion";

export default function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, Saurabh 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Your AI processed
          <span className="text-cyan-400 font-semibold">
            {" "}48 invoices{" "}
          </span>
          today with
          <span className="text-purple-400 font-semibold">
            {" "}98.7% accuracy.
          </span>
        </p>
      </div>

      <Button className="gap-2">
        <Upload size={18} />
        Upload Invoice
      </Button>
    </motion.div>
  );
}