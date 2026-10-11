import Card from "../ui/Card";
import { motion } from "framer-motion";

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      transition={{
        duration: .2,
      }}
    >
      <Card className="p-6">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-zinc-500">
              {title}
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {value}
            </h2>

            <p className="mt-3 text-green-400 text-sm">
              {change} this month
            </p>

          </div>

          <div className="rounded-2xl bg-cyan-500/10 p-4">
            <Icon
              size={30}
              className="text-cyan-400"
            />
          </div>

        </div>

      </Card>
    </motion.div>
  );
}