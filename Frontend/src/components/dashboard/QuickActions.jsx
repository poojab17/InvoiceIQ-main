import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  Upload,
  FileSearch,
  BarChart3,
  Settings,
} from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="p-6">

      <h2 className="text-xl font-semibold text-white mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <Button>
          <Upload size={18} />
          Upload
        </Button>

        <Button>
          <FileSearch size={18} />
          Review
        </Button>

        <Button>
          <BarChart3 size={18} />
          Analytics
        </Button>

        <Button>
          <Settings size={18} />
          Settings
        </Button>

      </div>

    </Card>
  );
}