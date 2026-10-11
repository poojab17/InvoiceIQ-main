import Card from "../ui/Card";
import { activity } from "../../data/activity";

export default function RecentActivity() {
  return (
    <Card className="p-6">

      <h2 className="text-xl font-semibold text-white mb-5">
        Recent Activity
      </h2>

      <div className="space-y-4">

        {activity.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-3"
          >

            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />

            <p className="text-zinc-300 text-sm">
              {item}
            </p>

          </div>

        ))}

      </div>

    </Card>
  );
}