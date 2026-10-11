import {
  ScanText,
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: ScanText,
    title: "OCR Processing",
    desc: "Reading invoice text",
  },
  {
    icon: LayoutDashboard,
    title: "Layout Analysis",
    desc: "Understanding invoice structure",
  },
  {
    icon: BrainCircuit,
    title: "Entity Extraction",
    desc: "Vendor, amount & tax detection",
  },
  {
    icon: ShieldCheck,
    title: "AI Validation",
    desc: "Confidence verification",
  },
  {
    icon: BarChart3,
    title: "Business Insights",
    desc: "Preparing analytics",
  },
];

export default function AIWorkflow({ currentStep }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">

      <h2 className="text-xl font-semibold text-white mb-6">
        AI Processing Pipeline
      </h2>

      <div className="space-y-5">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const completed = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={step.title}
              className="flex items-center gap-4"
            >
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${
                    completed
                      ? "bg-green-500/20"
                      : active
                      ? "bg-blue-500/20"
                      : "bg-gray-800"
                  }
                `}
              >
                {completed ? (
                  <CheckCircle2
                    className="text-green-400"
                    size={22}
                  />
                ) : (
                  <Icon
                    className={
                      active
                        ? "text-blue-400"
                        : "text-gray-500"
                    }
                    size={22}
                  />
                )}
              </div>

              <div>

                <h3 className="text-white font-medium">
                  {step.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {step.desc}
                </p>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}