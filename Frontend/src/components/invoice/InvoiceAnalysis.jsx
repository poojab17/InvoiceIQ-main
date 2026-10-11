import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock3,
  Cpu,
  FileText,
  ShieldCheck,
} from "lucide-react";


// ==========================================
// HELPERS
// ==========================================

const hasValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return false;
  }

  return true;
};


const displayValue = (value) =>
  hasValue(value)
    ? value
    : "Not extracted";


const formatAmount = (value) => {
  if (!hasValue(value)) {
    return "Not extracted";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Not extracted";
  }

  return number.toLocaleString(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  );
};


const formatConfidence = (value) => {
  /*
    Important:

    undefined/null means older invoice
    without persisted AI metadata.

    Actual 0 confidence remains 0%.
  */

  if (
    typeof value !== "number"
  ) {
    return null;
  }

  return `${Math.round(
    value * 100
  )}%`;
};


const confidenceColor = (
  value
) => {
  if (
    typeof value !== "number"
  ) {
    return "text-gray-500";
  }

  if (value >= 0.85) {
    return "text-emerald-400";
  }

  if (value >= 0.75) {
    return "text-amber-400";
  }

  return "text-red-400";
};


const getStatus = (status) => {
  switch (status) {
    case "processed":
      return {
        label: "Processed",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      };

    case "needs_review":
      return {
        label: "Needs Review",
        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
      };

    case "verified":
      return {
        label: "Verified",
        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-300",
      };

    default:
      return {
        label: "Unknown",
        className:
          "border-white/10 bg-white/5 text-gray-400",
      };
  }
};


export default function InvoiceAnalysis({
  invoice,
}) {
  if (!invoice) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#111827]
          p-8
          text-center
        "
      >
        <Brain
          size={36}
          className="
            mx-auto
            text-gray-700
          "
        />

        <h2
          className="
            mt-4
            font-semibold
            text-white
          "
        >
          No invoice selected
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-gray-500
          "
        >
          Select or upload an invoice to
          view AI extraction results.
        </p>
      </div>
    );
  }


  const aiMetadata =
    invoice?.aiMetadata;

  const fieldConfidence =
    aiMetadata?.fieldConfidence ||
    {};

  const overallConfidence =
    typeof aiMetadata
      ?.overallConfidence ===
    "number"
      ? aiMetadata.overallConfidence
      : null;

  const status =
    getStatus(
      invoice?.status
    );


  const fields = [
    {
      label: "Vendor Name",
      value:
        invoice?.vendor?.name,
      confidence:
        fieldConfidence.vendorName,
    },

    {
      label: "Invoice Number",
      value:
        invoice?.invoiceNumber,
      confidence:
        fieldConfidence.invoiceNumber,
    },

    {
      label: "Invoice Date",
      value:
        invoice?.invoiceDate,
      confidence:
        fieldConfidence.invoiceDate,
    },

    {
      label: "Customer Name",
      value:
        invoice?.customer?.name,
      confidence:
        fieldConfidence.customerName,
    },

    {
      label: "Customer Address",
      value:
        invoice?.customer?.address,
      confidence:
        fieldConfidence.customerAddress,
    },

    {
      label: "Customer GSTIN",
      value:
        invoice?.customer?.gstin,
      confidence:
        fieldConfidence.customerGstin,
    },

    {
      label: "Subtotal",
      value: formatAmount(
        invoice?.subtotal
      ),
      confidence:
        fieldConfidence.subtotal,
      alreadyFormatted: true,
    },

    {
      label: "Tax Rate",
      value:
        hasValue(
          invoice?.taxRate
        )
          ? `${invoice.taxRate}%`
          : "Not extracted",

      confidence:
        fieldConfidence.taxRate,

      alreadyFormatted: true,
    },

    {
      label: "Tax",
      value: formatAmount(
        invoice?.tax
      ),
      confidence:
        fieldConfidence.tax,
      alreadyFormatted: true,
    },

    {
      label: "Grand Total",
      value: formatAmount(
        invoice?.totalAmount
      ),
      confidence:
        fieldConfidence.total,
      alreadyFormatted: true,
    },
  ];


  return (
    <div className="space-y-6">

      {/* ====================================== */}
      {/* ANALYSIS CARD */}
      {/* ====================================== */}

      <div
        className="
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#111827]
          p-6
        "
      >

        {/* Header */}
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-purple-500/10
              "
            >
              <Brain
                size={23}
                className="
                  text-purple-400
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                AI Invoice Analysis
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Structured extraction with
                persisted AI confidence
              </p>
            </div>
          </div>


          <span
            className={`
              inline-flex
              w-fit
              rounded-full
              border
              px-3
              py-1.5
              text-xs
              font-medium
              ${status.className}
            `}
          >
            {status.label}
          </span>

        </div>


        {/* Filename */}
        <div
          className="
            mt-6
            flex
            items-center
            gap-4
            rounded-xl
            border
            border-white/[0.06]
            bg-[#080D18]
            p-4
          "
        >

          <FileText
            size={30}
            className="
              shrink-0
              text-blue-400
            "
          />


          <div className="min-w-0">

            <p
              className="
                truncate
                font-medium
                text-white
              "
            >
              {invoice?.filename ||
                "Processed Invoice"}
            </p>


            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Saved invoice document
            </p>

          </div>

        </div>


        {/* ==================================== */}
        {/* OVERALL CONFIDENCE */}
        {/* ==================================== */}

        <div
          className="
            mt-6
            rounded-xl
            border
            border-purple-500/15
            bg-purple-500/[0.04]
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-gray-200
                "
              >
                Overall AI Confidence
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Persisted extraction
                confidence from the AI
                pipeline
              </p>

            </div>


            <span
              className={`
                text-2xl
                font-bold
                ${
                  overallConfidence !==
                  null
                    ? confidenceColor(
                        overallConfidence
                      )
                    : "text-gray-500"
                }
              `}
            >
              {overallConfidence !==
              null
                ? formatConfidence(
                    overallConfidence
                  )
                : "N/A"}
            </span>

          </div>


          {overallConfidence !==
            null && (
            <div
              className="
                mt-4
                h-2
                overflow-hidden
                rounded-full
                bg-white/[0.06]
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-purple-500
                  transition-all
                "
                style={{
                  width: `${
                    overallConfidence *
                    100
                  }%`,
                }}
              />
            </div>
          )}

        </div>


        {/* ==================================== */}
        {/* EXTRACTED FIELDS */}
        {/* ==================================== */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
          "
        >

          {fields.map(
            (field) => {
              const rawValue =
                field.alreadyFormatted
                  ? field.value
                  : displayValue(
                      field.value
                    );

              const extracted =
                rawValue !==
                "Not extracted";

              const confidence =
                formatConfidence(
                  field.confidence
                );


              return (
                <div
                  key={field.label}
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-[#080D18]
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >

                    <div className="min-w-0">

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        {field.label}
                      </p>


                      <p
                        className={`
                          mt-1
                          break-words
                          text-sm
                          font-medium
                          ${
                            extracted
                              ? "text-gray-200"
                              : "text-amber-400"
                          }
                        `}
                      >
                        {rawValue}
                      </p>

                    </div>


                    {extracted ? (
                      <CheckCircle2
                        size={17}
                        className="
                          shrink-0
                          text-emerald-400
                        "
                      />
                    ) : (
                      <AlertCircle
                        size={17}
                        className="
                          shrink-0
                          text-amber-400
                        "
                      />
                    )}

                  </div>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      border-t
                      border-white/[0.05]
                      pt-3
                    "
                  >

                    <span
                      className="
                        text-[11px]
                        text-gray-600
                      "
                    >
                      AI Confidence
                    </span>


                    <span
                      className={`
                        text-xs
                        font-medium
                        ${
                          confidence
                            ? confidenceColor(
                                field.confidence
                              )
                            : "text-gray-600"
                        }
                      `}
                    >
                      {confidence ||
                        "Not available"}
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* ====================================== */}
      {/* LINE ITEMS */}
      {/* ====================================== */}

      <LineItems
        items={
          Array.isArray(
            invoice?.items
          )
            ? invoice.items
            : []
        }
        confidence={
          fieldConfidence.items
        }
      />


      {/* ====================================== */}
      {/* MODEL METADATA */}
      {/* ====================================== */}

      <div
        className="
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#111827]
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <ShieldCheck
            size={21}
            className="
              text-indigo-400
            "
          />

          <div>
            <h3
              className="
                font-semibold
                text-white
              "
            >
              AI Metadata
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Metadata persisted during
              document processing
            </p>
          </div>
        </div>


        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
          "
        >

          <MetadataCard
            icon={Cpu}
            label="Model Version"
            value={
              aiMetadata?.modelVersion ||
              "Not available"
            }
          />


          <MetadataCard
            icon={Clock3}
            label="Processing Time"
            value={
              typeof aiMetadata
                ?.processingTimeMs ===
                "number" &&
              aiMetadata.processingTimeMs >
                0
                ? `${(
                    aiMetadata.processingTimeMs /
                    1000
                  ).toFixed(2)} sec`
                : "Not available"
            }
          />

        </div>

      </div>

    </div>
  );
}


// ==========================================
// LINE ITEMS
// ==========================================

function LineItems({
  items,
  confidence,
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#111827]
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-white/[0.07]
          p-6
        "
      >

        <div>
          <h3
            className="
              font-semibold
              text-white
            "
          >
            Line Items
          </h3>

          <p
            className="
              mt-1
              text-xs
              text-gray-500
            "
          >
            Products and services
            extracted from the invoice
          </p>
        </div>


        <span
          className={`
            text-xs
            font-medium
            ${confidenceColor(
              confidence
            )}
          `}
        >
          {formatConfidence(
            confidence
          ) || "N/A"}
        </span>

      </div>


      {items.length === 0 ? (

        <div
          className="
            px-6
            py-10
            text-center
          "
        >
          <p
            className="
              text-sm
              text-gray-500
            "
          >
            No line items extracted.
          </p>
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr
                className="
                  border-b
                  border-white/[0.06]
                  text-left
                  text-xs
                  uppercase
                  tracking-wide
                  text-gray-600
                "
              >
                <th className="px-5 py-4">
                  Description
                </th>

                <th className="px-5 py-4">
                  Quantity
                </th>

                <th className="px-5 py-4">
                  Rate
                </th>

                <th className="px-5 py-4">
                  Tax
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>
              </tr>
            </thead>


            <tbody>

              {items.map(
                (item, index) => (
                  <tr
                    key={`${item?.name || "item"}-${index}`}
                    className="
                      border-b
                      border-white/[0.05]
                      text-sm
                    "
                  >

                    <td
                      className="
                        px-5
                        py-4
                        text-gray-200
                      "
                    >
                      {displayValue(
                        item?.description ||
                          item?.name
                      )}
                    </td>


                    <td
                      className="
                        px-5
                        py-4
                        text-gray-400
                      "
                    >
                      {displayValue(
                        item?.quantity
                      )}
                    </td>


                    <td
                      className="
                        px-5
                        py-4
                        text-gray-400
                      "
                    >
                      {formatAmount(
                        item?.rate ??
                          item?.unitPrice
                      )}
                    </td>


                    <td
                      className="
                        px-5
                        py-4
                        text-gray-400
                      "
                    >
                      {hasValue(
                        item?.taxRate
                      )
                        ? `${item.taxRate}%`
                        : "Not extracted"}
                    </td>


                    <td
                      className="
                        px-5
                        py-4
                        font-medium
                        text-white
                      "
                    >
                      {formatAmount(
                        item?.amount
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}


// ==========================================
// METADATA
// ==========================================

function MetadataCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-[#080D18]
        p-4
      "
    >
      <Icon
        size={18}
        className="
          text-gray-500
        "
      />

      <p
        className="
          mt-3
          text-xs
          text-gray-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-medium
          text-gray-200
        "
      >
        {value}
      </p>
    </div>
  );
}