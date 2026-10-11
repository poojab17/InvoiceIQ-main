// ==========================================
// SAFE NUMBER
// ==========================================

export function getValidAmount(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned =
    typeof value === "string"
      ? value.replace(/[^0-9.-]/g, "")
      : value;

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}


// ==========================================
// CURRENCY FORMATTER
// ==========================================

export function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Not extracted";
  }

  return number.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}


// ==========================================
// MAIN ANALYTICS
// ==========================================

export function calculateInvoiceAnalytics(
  invoices = []
) {
  if (!Array.isArray(invoices)) {
    invoices = [];
  }


  // ------------------------------------------
  // Valid invoice amounts
  // ------------------------------------------

  const invoicesWithAmounts =
    invoices
      .map((invoice) => ({
        ...invoice,

        parsedAmount:
          getValidAmount(
            invoice?.totalAmount
          ),
      }))
      .filter(
        (invoice) =>
          invoice.parsedAmount !== null
      );


  // ------------------------------------------
  // Total invoices
  // ------------------------------------------

  const totalInvoices =
    invoices.length;


  // ------------------------------------------
  // Total amount
  // ------------------------------------------

  const totalAmount =
    invoicesWithAmounts.reduce(
      (sum, invoice) =>
        sum + invoice.parsedAmount,
      0
    );


  // ------------------------------------------
  // Average
  // ------------------------------------------

  const averageAmount =
    invoicesWithAmounts.length > 0
      ? totalAmount /
        invoicesWithAmounts.length
      : 0;


  // ------------------------------------------
  // Highest invoice
  // ------------------------------------------

  const highestInvoice =
    invoicesWithAmounts.length > 0
      ? invoicesWithAmounts.reduce(
          (highest, invoice) =>
            invoice.parsedAmount >
            highest.parsedAmount
              ? invoice
              : highest
        )
      : null;


  // ------------------------------------------
  // Lowest invoice
  // ------------------------------------------

  const lowestInvoice =
    invoicesWithAmounts.length > 0
      ? invoicesWithAmounts.reduce(
          (lowest, invoice) =>
            invoice.parsedAmount <
            lowest.parsedAmount
              ? invoice
              : lowest
        )
      : null;


  // ------------------------------------------
  // Vendor frequency
  // ------------------------------------------

  const vendorCounts = {};

  invoices.forEach((invoice) => {
    const vendor =
      invoice?.vendor?.name?.trim();

    if (!vendor) {
      return;
    }

    const key =
      vendor.toLowerCase();

    if (!vendorCounts[key]) {
      vendorCounts[key] = {
        name: vendor,
        count: 0,
        amount: 0,
      };
    }

    vendorCounts[key].count += 1;

    const amount =
      getValidAmount(
        invoice?.totalAmount
      );

    if (amount !== null) {
      vendorCounts[key].amount +=
        amount;
    }
  });


  const vendorDistribution =
    Object.values(vendorCounts)
      .sort(
        (a, b) =>
          b.count - a.count
      );


  const mostFrequentVendor =
    vendorDistribution[0] || null;


  // ------------------------------------------
  // Monthly analytics
  // ------------------------------------------

  const monthlyMap = {};


  invoices.forEach((invoice) => {
    /*
      createdAt is preferred because it tells
      us when InvoiceIQ processed the invoice.

      We do not depend on extracted invoiceDate
      because OCR dates may be incomplete.
    */

    if (!invoice?.createdAt) {
      return;
    }

    const date =
      new Date(invoice.createdAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return;
    }


    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;


    const label =
      date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      );


    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        key,
        month: label,
        invoices: 0,
        spending: 0,
      };
    }


    monthlyMap[key].invoices += 1;


    const amount =
      getValidAmount(
        invoice?.totalAmount
      );


    if (amount !== null) {
      monthlyMap[key].spending +=
        amount;
    }
  });


  const monthlyData =
    Object.values(monthlyMap)
      .sort(
        (a, b) =>
          a.key.localeCompare(
            b.key
          )
      );


  // ------------------------------------------
  // Amount trend
  // ------------------------------------------

  const amountTrend =
    invoicesWithAmounts
      .filter(
        (invoice) =>
          invoice?.createdAt
      )
      .map((invoice) => {
        const date =
          new Date(
            invoice.createdAt
          );

        return {
          id: invoice._id,

          date,

          label:
            Number.isNaN(
              date.getTime()
            )
              ? "Unknown"
              : date.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                ),

          amount:
            invoice.parsedAmount,

          vendor:
            invoice?.vendor?.name ||
            "Unknown vendor",
        };
      })
      .filter(
        (item) =>
          !Number.isNaN(
            item.date.getTime()
          )
      )
      .sort(
        (a, b) =>
          a.date - b.date
      )
      .map(
        ({
          date,
          ...item
        }) => item
      );


  return {
    totalInvoices,
    totalAmount,
    averageAmount,

    extractedAmountCount:
      invoicesWithAmounts.length,

    highestInvoice,
    lowestInvoice,

    mostFrequentVendor,
    vendorDistribution,

    monthlyData,
    amountTrend,
  };
}