import { motion } from "framer-motion";
import Card from "../ui/Card";

export default function ChartCard({
  title,
  subtitle,
  children,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 h-full">

        <div className="mb-6">

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          {subtitle && (
            <p className="text-zinc-400 text-sm mt-1">
              {subtitle}
            </p>
          )}

        </div>

        {children}

      </Card>
    </motion.div>
  );
}