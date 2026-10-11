import Card from "../ui/Card";
import { Brain } from "lucide-react";
import { recommendations } from "../../data/recommendations";

export default function RecommendationCard() {
  return (
    <Card className="p-6">

      <div className="flex items-center gap-3 mb-5">

        <Brain className="text-cyan-400" />

        <h2 className="text-xl font-semibold">
          AI Recommendations
        </h2>

      </div>

      <div className="space-y-3">

        {recommendations.map((item) => (

          <div
            key={item}
            className="rounded-xl bg-zinc-900 p-3"
          >
            {item}
          </div>

        ))}

      </div>

    </Card>
  );
}