import {
  Brain,
  BadgeCheck,
  AlertTriangle,
  Clock3,
  Sparkles,
  FileSearch,
} from "lucide-react";

const insights = [
  {
    icon: BadgeCheck,
    color: "text-green-400",
    title: "Invoice Verified",
    description:
      "All mandatory fields were detected successfully.",
  },
  {
    icon: FileSearch,
    color: "text-blue-400",
    title: "Duplicate Check",
    description:
      "No duplicate invoice found in the database.",
  },
  {
    icon: AlertTriangle,
    color: "text-yellow-400",
    title: "Risk Analysis",
    description:
      "No fraud indicators detected.",
  },
];

const timeline = [
  {
    title: "Invoice Uploaded",
    time: "09:41 AM",
  },
  {
    title: "OCR Completed",
    time: "09:41:03",
  },
  {
    title: "AI Entity Extraction",
    time: "09:41:06",
  },
  {
    title: "Validation Completed",
    time: "09:41:09",
  },
];

export default function AIInsights() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Brain className="text-violet-400" />

        <div>

          <h2 className="text-xl font-semibold text-white">
            AI Insights
          </h2>

          <p className="text-gray-400 text-sm">
            Intelligent document analysis
          </p>

        </div>

      </div>

      {/* Summary */}

      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-5 mb-6">

        <div className="flex gap-3">

          <Sparkles className="text-violet-400 mt-1" />

          <div>

            <h3 className="text-white font-semibold">
              AI Summary
            </h3>

            <p className="text-gray-300 mt-2 leading-7">
              The invoice was processed successfully with
              high confidence. Vendor information, invoice
              number, total amount, tax information and dates
              were extracted accurately. No anomalies or
              duplicate invoices were detected.
            </p>

          </div>

        </div>

      </div>

      {/* Insights */}

      <div className="space-y-4">

        {insights.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              className="bg-[#0F172A] rounded-xl border border-gray-800 p-4 flex gap-4"
            >

              <div className="w-11 h-11 rounded-lg bg-gray-900 flex items-center justify-center">

                <Icon
                  className={item.color}
                  size={20}
                />

              </div>

              <div>

                <h4 className="text-white font-medium">
                  {item.title}
                </h4>

                <p className="text-gray-400 text-sm mt-1">
                  {item.description}
                </p>

              </div>

            </div>

          );

        })}

      </div>

      {/* Timeline */}

      <div className="mt-8">

        <div className="flex items-center gap-2 mb-5">

          <Clock3
            size={18}
            className="text-blue-400"
          />

          <h3 className="text-white font-semibold">
            Processing Timeline
          </h3>

        </div>

        <div className="space-y-4">

          {timeline.map((step, index) => (

            <div
              key={index}
              className="flex justify-between items-center border-l-2 border-blue-500 pl-4"
            >

              <span className="text-gray-300">
                {step.title}
              </span>

              <span className="text-gray-500 text-sm">
                {step.time}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}