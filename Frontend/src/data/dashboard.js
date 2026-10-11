import {
  FileText,
  Brain,
  BadgeCheck,
  CircleAlert,
  IndianRupee,
  Copy,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

export const stats = [
  {
    title: "Total Invoices",
    value: "1,248",
    change: "+12%",
    icon: FileText,
  },

  {
    title: "AI Accuracy",
    value: "98.7%",
    change: "+1.2%",
    icon: Brain,
  },

  {
    title: "Average Confidence",
    value: "96.4%",
    change: "+0.8%",
    icon: BadgeCheck,
  },

  {
    title: "Needs Review",
    value: "18",
    change: "-5%",
    icon: CircleAlert,
  },

  {
    title: "Monthly Spend",
    value: "₹18.5L",
    change: "+15%",
    icon: IndianRupee,
  },

  {
    title: "Duplicates",
    value: "7",
    change: "-2",
    icon: Copy,
  },

  {
    title: "Processed",
    value: "1130",
    change: "+90",
    icon: ScanSearch,
  },

  {
    title: "Validated",
    value: "1094",
    change: "+95",
    icon: ShieldCheck,
  },
];