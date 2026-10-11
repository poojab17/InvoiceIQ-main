import Card from "../ui/Card";
import { Brain } from "lucide-react";
import { insights } from "../../data/insights";

export default function AIInsights() {
  return (
    <Card className="p-6">

      <div className="flex items-center gap-3 mb-5">

        <Brain className="text-cyan-400" />

        <h2 className="text-xl font-semibold text-white">
          AI Insights
        </h2>

      </div>

      <div className="space-y-3">

        {insights.map((item) => (

          <div
            key={item}
            className="rounded-xl bg-zinc-900 p-3 text-zinc-300"
          >
            {item}
          </div>

        ))}

      </div>

    </Card>
  );
}