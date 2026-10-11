import { motion } from "framer-motion";
import { ShieldCheck, Brain } from "lucide-react";

const metrics = [
  {
    label: "OCR Accuracy",
    value: 98,
  },
  {
    label: "Field Extraction",
    value: 99,
  },
  {
    label: "Validation",
    value: 97,
  },
];

export default function ConfidenceScore() {
  const overall = 98;

  const radius = 60;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (overall / 100) * circumference;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">

      <div className="flex items-center gap-3 mb-6">

        <Brain className="text-purple-400" />

        <div>
          <h2 className="text-xl font-semibold text-white">
            AI Confidence
          </h2>

          <p className="text-gray-400 text-sm">
            Overall extraction quality
          </p>
        </div>

      </div>

      <div className="flex flex-col items-center">

        <svg
          width="150"
          height="150"
          className="-rotate-90"
        >

          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#1f2937"
            strokeWidth={stroke}
            fill="transparent"
          />

          <motion.circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#3b82f6"
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference,
            }}
            animate={{
              strokeDashoffset: offset,
            }}
            transition={{
              duration: 2,
            }}
          />

        </svg>

        <div className="-mt-24 text-center">

          <h1 className="text-4xl font-bold text-white">
            {overall}%
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Confidence
          </p>

        </div>

      </div>

      <div className="mt-10 space-y-5">

        {metrics.map((metric) => (

          <div key={metric.label}>

            <div className="flex justify-between mb-2">

              <span className="text-gray-300">
                {metric.label}
              </span>

              <span className="text-green-400">
                {metric.value}%
              </span>

            </div>

            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">

              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${metric.value}%`,
                }}
                transition={{
                  duration: 1.5,
                }}
              />

            </div>

          </div>

        ))}

      </div>

      <div className="mt-8 flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">

        <ShieldCheck className="text-green-400" />

        <div>

          <p className="text-green-400 font-medium">
            AI Verification Passed
          </p>

          <p className="text-gray-400 text-sm">
            No inconsistencies detected.
          </p>

        </div>

      </div>

    </div>
  );
}