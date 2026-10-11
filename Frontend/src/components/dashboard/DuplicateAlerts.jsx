import Card from "../ui/Card";
import { duplicateAlerts } from "../../data/duplicateAlerts";

export default function DuplicateAlerts() {
  return (
    <Card className="p-6">

      <h2 className="text-xl font-semibold text-red-400 mb-5">
        Duplicate Alerts
      </h2>

      <div className="space-y-4">

        {duplicateAlerts.map((item) => (

          <div
            key={item.id}
            className="rounded-xl bg-zinc-900 p-4 border border-red-500/20"
          >
            <p>{item.id}</p>

            <p className="text-zinc-400">
              {item.vendor}
            </p>

            <p>{item.amount}</p>

          </div>

        ))}

      </div>

    </Card>
  );
}