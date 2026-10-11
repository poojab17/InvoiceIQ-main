import Card from "../ui/Card";
import { processingQueue } from "../../data/processingQueue";

export default function ProcessingQueue() {
  return (
    <Card className="p-6">

      <h2 className="text-xl font-semibold text-white mb-5">
        Processing Queue
      </h2>

      <div className="space-y-5">

        {processingQueue.map((item) => (

          <div key={item.id}>

            <div className="flex justify-between mb-2">

              <span>{item.vendor}</span>

              <span>{item.progress}%</span>

            </div>

            <div className="w-full h-2 rounded-full bg-zinc-800">

              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${item.progress}%` }}
              />

            </div>

            <p className="text-xs text-zinc-500 mt-2">
              {item.stage}
            </p>

          </div>

        ))}

      </div>

    </Card>
  );
}