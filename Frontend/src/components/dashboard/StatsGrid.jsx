import { stats } from "../../data/dashboard";
import StatsCard from "./StatsCard";

export default function StatsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">

      {stats.map((item) => (

        <StatsCard
          key={item.title}
          {...item}
        />

      ))}

    </div>
  );
}