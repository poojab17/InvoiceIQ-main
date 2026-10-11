import {
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  CheckCircle
} from "lucide-react";

const fields = [
  {
    icon: Building2,
    label: "Vendor",
    value: "Tech Solutions Pvt Ltd"
  },
  {
    icon: FileText,
    label: "Invoice Number",
    value: "INV-2026-458"
  },
  {
    icon: Calendar,
    label: "Invoice Date",
    value: "25 July 2026"
  },
  {
    icon: DollarSign,
    label: "Total Amount",
    value: "$2,450.00"
  },
  {
    icon: Hash,
    label: "GST Number",
    value: "29ABCDE1234F2Z5"
  }
];

export default function ExtractedFields() {

  return (

    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-semibold text-white">
            Extracted Fields
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            AI detected invoice information
          </p>

        </div>

        <CheckCircle className="text-green-400" size={24} />

      </div>

      <div className="space-y-4">

        {fields.map((field, index) => {

          const Icon = field.icon;

          return (

            <div
              key={index}
              className="flex items-center justify-between bg-[#0F172A] rounded-xl p-4 border border-gray-800"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center">

                  <Icon className="text-blue-400" size={20} />

                </div>

                <div>

                  <p className="text-gray-400 text-xs uppercase tracking-wide">
                    {field.label}
                  </p>

                  <p className="text-white font-medium mt-1">
                    {field.value}
                  </p>

                </div>

              </div>

              <span className="text-green-400 text-sm font-medium">
                99%
              </span>

            </div>

          );

        })}

      </div>

    </div>

  );

}