import {
  AlertTriangle,
} from "lucide-react";


export default function MissingFieldsChart({
  data = [],
  totalInvoices = 0,
}) {
  const fields =
    data.slice(0, 6);

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#111827]
        p-6
      "
    >

      <div>

        <h2
          className="
            font-semibold
            text-white
          "
        >
          Most Missing Fields
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Fields most often missing from
          extracted invoice data.
        </p>

      </div>


      {fields.length === 0 ? (

        <div
          className="
            flex
            min-h-[300px]
            items-center
            justify-center
            text-center
          "
        >

          <div>

            <p
              className="
                font-medium
                text-gray-300
              "
            >
              No missing fields
            </p>


            <p
              className="
                mt-1
                text-xs
                text-gray-600
              "
            >
              Current invoice data has
              full field coverage.
            </p>

          </div>

        </div>

      ) : (

        <div
          className="
            mt-6
            space-y-5
          "
        >

          {fields.map(
            (field) => {
              const missingPercentage =
                totalInvoices > 0
                  ? Math.round(
                      (
                        field.missing /
                        totalInvoices
                      ) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={field.key}
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <AlertTriangle
                        size={15}
                        className="
                          text-amber-400
                        "
                      />


                      <span
                        className="
                          text-sm
                          text-gray-300
                        "
                      >
                        {field.field}
                      </span>

                    </div>


                    <span
                      className="
                        text-xs
                        font-medium
                        text-gray-500
                      "
                    >
                      {field.missing}/
                      {totalInvoices}
                    </span>

                  </div>


                  <div
                    className="
                      mt-2
                      h-1.5
                      overflow-hidden
                      rounded-full
                      bg-white/[0.05]
                    "
                  >

                    <div
                      className="
                        h-full
                        rounded-full
                        bg-amber-500
                      "
                      style={{
                        width:
                          `${missingPercentage}%`,
                      }}
                    />

                  </div>


                  <p
                    className="
                      mt-1
                      text-right
                      text-[10px]
                      text-gray-600
                    "
                  >
                    {missingPercentage}%
                    missing
                  </p>

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}