import Card from "../ui/Card";
import { Brain, ShieldCheck, ScanSearch, Activity } from "lucide-react";

const items = [
  {
    icon: Brain,
    title: "AI Accuracy",
    value: "98.7%",
  },
  {
    icon: ScanSearch,
    title: "OCR Engine",
    value: "Online",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    value: "Healthy",
  },
  {
    icon: Activity,
    title: "Last Scan",
    value: "2 min ago",
  },
];

export default function AIHealthBanner() {
  return (
    <Card className="mb-8 overflow-hidden">

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              AI Engine Health
            </h2>

            <p className="text-zinc-400 mt-1">
              All AI systems are operating normally.
            </p>

          </div>

          <div className="rounded-full bg-green-500/15 px-4 py-2 text-green-400 font-medium">
            ● Healthy
          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {items.map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-zinc-900/50 p-5"
              >
                <Icon className="text-cyan-400 mb-3" />

                <p className="text-sm text-zinc-500">
                  {item.title}
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {item.value}
                </h3>

              </div>
            );

          })}

        </div>

      </div>

    </Card>
  );
}