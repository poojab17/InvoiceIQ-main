// ==========================================
// VALUE HELPERS
// ==========================================

export function hasExtractedValue(value) {
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

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}


// ==========================================
// FIELD DEFINITIONS
// ==========================================

const FIELD_DEFINITIONS = [
  {
    key: "vendor",
    label: "Vendor Name",
    getValue: (invoice) =>
      invoice?.vendor?.name,
  },

  {
    key: "invoiceNumber",
    label: "Invoice Number",
    getValue: (invoice) =>
      invoice?.invoiceNumber,
  },

  {
    key: "invoiceDate",
    label: "Invoice Date",
    getValue: (invoice) =>
      invoice?.invoiceDate,
  },

  {
    key: "customerName",
    label: "Customer Name",
    getValue: (invoice) =>
      invoice?.customer?.name,
  },

  {
    key: "customerAddress",
    label: "Customer Address",
    getValue: (invoice) =>
      invoice?.customer?.address,
  },

  {
    key: "gstin",
    label: "Customer GSTIN",
    getValue: (invoice) =>
      invoice?.customer?.gstin,
  },

  {
    key: "subtotal",
    label: "Subtotal",
    getValue: (invoice) =>
      invoice?.subtotal,
  },

  {
    key: "tax",
    label: "Tax",
    getValue: (invoice) =>
      invoice?.tax,
  },

  {
    key: "totalAmount",
    label: "Total Amount",
    getValue: (invoice) =>
      invoice?.totalAmount,
  },

  {
    key: "items",
    label: "Line Items",
    getValue: (invoice) =>
      invoice?.items,
  },

  {
    key: "ocr",
    label: "OCR Text",
    getValue: (invoice) =>
      invoice?.extractedText,
  },
];


// ==========================================
// INVOICE COMPLETENESS
// ==========================================

export function calculateInvoiceCompleteness(
  invoice
) {
  const totalFields =
    FIELD_DEFINITIONS.length;

  const extractedFields =
    FIELD_DEFINITIONS.filter(
      (field) =>
        hasExtractedValue(
          field.getValue(invoice)
        )
    ).length;

  const percentage =
    totalFields > 0
      ? Math.round(
          (extractedFields /
            totalFields) *
            100
        )
      : 0;

  return {
    extractedFields,
    totalFields,
    percentage,
  };
}


// ==========================================
// MAIN INSIGHTS
// ==========================================

export function calculateAIInsights(
  invoices = []
) {
  const safeInvoices =
    Array.isArray(invoices)
      ? invoices
      : [];

  const totalInvoices =
    safeInvoices.length;


  // ------------------------------------------
  // FIELD COVERAGE
  // ------------------------------------------

  const fieldCoverage =
    FIELD_DEFINITIONS.map(
      (field) => {
        const extractedCount =
          safeInvoices.filter(
            (invoice) =>
              hasExtractedValue(
                field.getValue(invoice)
              )
          ).length;

        const missingCount =
          totalInvoices -
          extractedCount;

        const coverage =
          totalInvoices > 0
            ? Math.round(
                (extractedCount /
                  totalInvoices) *
                  100
              )
            : 0;

        return {
          key: field.key,
          field: field.label,
          extracted:
            extractedCount,
          missing:
            missingCount,
          coverage,
        };
      }
    );


  // ------------------------------------------
  // MISSING FIELD RANKING
  // ------------------------------------------

  const mostMissingFields =
    [...fieldCoverage]
      .sort(
        (a, b) =>
          b.missing -
          a.missing
      )
      .filter(
        (field) =>
          field.missing > 0
      );


  // ------------------------------------------
  // PER-INVOICE COMPLETENESS
  // ------------------------------------------

  const invoiceCompleteness =
    safeInvoices.map(
      (invoice) => {
        const completeness =
          calculateInvoiceCompleteness(
            invoice
          );

        return {
          id: invoice?._id,
          filename:
            invoice?.filename ||
            "Unnamed invoice",

          vendor:
            invoice?.vendor?.name ||
            "Not extracted",

          createdAt:
            invoice?.createdAt,

          ...completeness,
        };
      }
    );


  // ------------------------------------------
  // AVERAGE COMPLETENESS
  // ------------------------------------------

  const averageCompleteness =
    invoiceCompleteness.length > 0
      ? Math.round(
          invoiceCompleteness.reduce(
            (sum, invoice) =>
              sum +
              invoice.percentage,
            0
          ) /
            invoiceCompleteness.length
        )
      : 0;


  // ------------------------------------------
  // COMPLETENESS DISTRIBUTION
  // ------------------------------------------

  const distribution = {
    excellent: 0,
    good: 0,
    partial: 0,
    low: 0,
  };


  invoiceCompleteness.forEach(
    (invoice) => {
      const value =
        invoice.percentage;

      if (value >= 80) {
        distribution.excellent +=
          1;
      } else if (value >= 60) {
        distribution.good += 1;
      } else if (value >= 30) {
        distribution.partial +=
          1;
      } else {
        distribution.low += 1;
      }
    }
  );


  const completenessDistribution = [
    {
      name: "Excellent",
      value:
        distribution.excellent,
      range: "80–100%",
    },

    {
      name: "Good",
      value:
        distribution.good,
      range: "60–79%",
    },

    {
      name: "Partial",
      value:
        distribution.partial,
      range: "30–59%",
    },

    {
      name: "Low",
      value:
        distribution.low,
      range: "0–29%",
    },
  ];


  // ------------------------------------------
  // IMPORTANT FIELD COVERAGE
  // ------------------------------------------

  const getCoverage = (key) =>
    fieldCoverage.find(
      (field) =>
        field.key === key
    )?.coverage || 0;


  const vendorCoverage =
    getCoverage("vendor");

  const dateCoverage =
    getCoverage(
      "invoiceDate"
    );

  const totalCoverage =
    getCoverage(
      "totalAmount"
    );

  const gstinCoverage =
    getCoverage("gstin");

  const lineItemCoverage =
    getCoverage("items");

  const ocrCoverage =
    getCoverage("ocr");


  // ------------------------------------------
  // FULLY EXTRACTED INVOICES
  // ------------------------------------------

  const fullyExtractedInvoices =
    invoiceCompleteness.filter(
      (invoice) =>
        invoice.percentage ===
        100
    ).length;


  return {
    totalInvoices,

    fieldCoverage,

    mostMissingFields,

    invoiceCompleteness,

    averageCompleteness,

    completenessDistribution,

    fullyExtractedInvoices,

    vendorCoverage,
    dateCoverage,
    totalCoverage,
    gstinCoverage,
    lineItemCoverage,
    ocrCoverage,
  };
}