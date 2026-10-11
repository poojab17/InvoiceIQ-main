import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BrainCircuit,
  FileCheck2,
  Building2,
  CalendarDays,
  IndianRupee,
  ScanText,
  ListTree,
  AlertCircle,
  Gauge,
  Clock3,
  Cpu,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import {
  getInvoices,
  getInvoiceStats,
} from "../../services/invoiceApi";

import {
  calculateAIInsights,
} from "../../utils/insightsUtils";

import InsightCard from "../../components/insights/InsightCard";
import FieldCoverageChart from "../../components/insights/FieldCoverageChart";
import MissingFieldsChart from "../../components/insights/MissingFieldsChart";
import CompletenessDistribution from "../../components/insights/CompletenessDistribution";


const PAGE_LIMIT = 50;


export default function AIInsights() {
  const [
    invoices,
    setInvoices,
  ] = useState([]);

  const [
    stats,
    setStats,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // FETCH ALL USER INVOICES
  // ==========================================

  const fetchAllInvoices =
    useCallback(async () => {
      const firstResponse =
        await getInvoices({
          page: 1,
          limit: PAGE_LIMIT,
          sort: "newest",
        });


      const firstInvoices =
        Array.isArray(
          firstResponse?.invoices
        )
          ? firstResponse.invoices
          : [];


      const totalPages =
        Number(
          firstResponse
            ?.pagination
            ?.totalPages
        ) || 1;


      if (
        totalPages <= 1
      ) {
        return firstInvoices;
      }


      const requests = [];


      for (
        let page = 2;
        page <= totalPages;
        page += 1
      ) {
        requests.push(
          getInvoices({
            page,
            limit: PAGE_LIMIT,
            sort: "newest",
          })
        );
      }


      const responses =
        await Promise.all(
          requests
        );


      const remaining =
        responses.flatMap(
          (response) =>
            Array.isArray(
              response?.invoices
            )
              ? response.invoices
              : []
        );


      return [
        ...firstInvoices,
        ...remaining,
      ];
    }, []);


  // ==========================================
  // LOAD
  // ==========================================

  const loadInsights =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");


        const [
          allInvoices,
          statsResponse,
        ] =
          await Promise.all([
            fetchAllInvoices(),
            getInvoiceStats(),
          ]);


        setInvoices(
          allInvoices
        );


        setStats(
          statsResponse?.stats ||
            null
        );

      } catch (err) {
        console.error(
          "AI insights load error:",
          err
        );


        setError(
          err?.message ||
            "Unable to load AI insights."
        );

      } finally {
        setLoading(false);
      }
    }, [fetchAllInvoices]);


  useEffect(() => {
    loadInsights();
  }, [loadInsights]);


  // ==========================================
  // EXISTING COMPLETENESS INSIGHTS
  // ==========================================

  const insights =
    useMemo(
      () =>
        calculateAIInsights(
          invoices
        ),
      [invoices]
    );


  // ==========================================
  // REAL AI METADATA INSIGHTS
  // ==========================================

  const aiMetrics =
    useMemo(() => {
      const withAI =
        invoices.filter(
          (invoice) =>
            invoice?.aiMetadata &&
            typeof invoice
              ?.aiMetadata
              ?.overallConfidence ===
              "number"
        );


      const confidenceValues =
        withAI.map(
          (invoice) =>
            invoice.aiMetadata
              .overallConfidence
        );


      const averageConfidence =
        confidenceValues.length >
        0
          ? confidenceValues.reduce(
              (
                total,
                value
              ) =>
                total + value,
              0
            ) /
            confidenceValues.length
          : null;


      const lowConfidenceInvoices =
        withAI.filter(
          (invoice) =>
            invoice.aiMetadata
              .overallConfidence <
            0.75
        ).length;


      const processingTimes =
        invoices
          .map(
            (invoice) =>
              invoice?.aiMetadata
                ?.processingTimeMs
          )
          .filter(
            (value) =>
              typeof value ===
                "number" &&
              value > 0
          );


      const averageProcessingTime =
        processingTimes.length >
        0
          ? processingTimes.reduce(
              (
                total,
                value
              ) =>
                total + value,
              0
            ) /
            processingTimes.length
          : null;


      const modelVersions =
        invoices
          .map(
            (invoice) =>
              invoice?.aiMetadata
                ?.modelVersion
          )
          .filter(Boolean);


      const modelVersionCounts =
        modelVersions.reduce(
          (
            result,
            version
          ) => {
            result[version] =
              (result[version] ||
                0) + 1;

            return result;
          },
          {}
        );


      const primaryModel =
        Object.entries(
          modelVersionCounts
        ).sort(
          (a, b) =>
            b[1] - a[1]
        )[0]?.[0] ||
        null;


      // ======================================
      // FIELD CONFIDENCE AGGREGATION
      // ======================================

      const fieldConfidenceKeys = [
        "vendorName",
        "invoiceNumber",
        "invoiceDate",
        "customerName",
        "customerAddress",
        "customerGstin",
        "items",
        "subtotal",
        "discount",
        "taxRate",
        "tax",
        "total",
      ];


      const fieldConfidence =
        fieldConfidenceKeys.map(
          (key) => {
            const values =
              invoices
                .map(
                  (invoice) =>
                    invoice
                      ?.aiMetadata
                      ?.fieldConfidence
                      ?.[key]
                )
                .filter(
                  (value) =>
                    typeof value ===
                    "number"
                );


            const average =
              values.length > 0
                ? values.reduce(
                    (
                      total,
                      value
                    ) =>
                      total +
                      value,
                    0
                  ) /
                  values.length
                : null;


            return {
              key,
              label:
                formatFieldName(
                  key
                ),
              average,
              percentage:
                average !== null
                  ? Math.round(
                      average *
                        100
                    )
                  : null,
            };
          }
        );


      return {
        metadataCount:
          withAI.length,

        averageConfidence,

        lowConfidenceInvoices,

        averageProcessingTime,

        primaryModel,

        fieldConfidence,
      };

    }, [invoices]);


  // ==========================================
  // BACKEND STATS
  // ==========================================

  const backendAverageConfidence =
    typeof stats
      ?.averageConfidencePercentage ===
    "number"
      ? stats.averageConfidencePercentage
      : aiMetrics
          .averageConfidence !==
        null
      ? aiMetrics.averageConfidence *
        100
      : null;


  const needsReview =
    stats
      ?.needsReviewInvoices ??
    invoices.filter(
      (invoice) =>
        invoice?.status ===
        "needs_review"
    ).length;


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <InsightsSkeleton />
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="space-y-8">

        <PageHeader />


        <div
          className="
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/[0.05]
            p-8
          "
        >

          <AlertCircle
            size={24}
            className="
              text-red-400
            "
          />


          <h2
            className="
              mt-5
              text-lg
              font-semibold
              text-white
            "
          >
            AI insights unavailable
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-gray-400
            "
          >
            {error}
          </p>


          <button
            type="button"
            onClick={
              loadInsights
            }
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-2.5
              text-sm
              font-medium
              text-red-300
            "
          >
            <RefreshCw
              size={16}
            />

            Try Again
          </button>

        </div>

      </div>
    );
  }


  // ==========================================
  // EMPTY
  // ==========================================

  if (
    invoices.length === 0
  ) {
    return (
      <div className="space-y-8">

        <PageHeader />


        <div
          className="
            flex
            min-h-[430px]
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-white/[0.1]
            bg-[#111827]
            p-8
          "
        >

          <div
            className="
              max-w-md
              text-center
            "
          >

            <BrainCircuit
              size={40}
              className="
                mx-auto
                text-purple-400
              "
            />


            <h2
              className="
                mt-5
                text-xl
                font-semibold
                text-white
              "
            >
              No AI insights yet
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500
              "
            >
              Process invoices to
              analyze extraction
              completeness and AI
              confidence.
            </p>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="space-y-8">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >

        <PageHeader />


        <button
          type="button"
          onClick={
            loadInsights
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/[0.08]
            bg-[#111827]
            px-4
            py-2.5
            text-sm
            text-gray-400
            transition
            hover:bg-white/[0.04]
            hover:text-gray-200
          "
        >
          <RefreshCw
            size={16}
          />

          Refresh
        </button>

      </div>


      {/* ====================================== */}
      {/* COMPLETENESS KPI GRID */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-6
        "
      >

        <InsightCard
          icon={FileCheck2}
          iconClass="
            text-green-400
            bg-green-500/10
          "
          label="Average Completeness"
          value={`${insights.averageCompleteness}%`}
          description="Field presence across invoices"
        />


        <InsightCard
          icon={Building2}
          iconClass="
            text-purple-400
            bg-purple-500/10
          "
          label="Vendor Coverage"
          value={`${insights.vendorCoverage}%`}
          description="Invoices with extracted vendor"
        />


        <InsightCard
          icon={CalendarDays}
          iconClass="
            text-blue-400
            bg-blue-500/10
          "
          label="Date Coverage"
          value={`${insights.dateCoverage}%`}
          description="Invoices with extracted date"
        />


        <InsightCard
          icon={IndianRupee}
          iconClass="
            text-emerald-400
            bg-emerald-500/10
          "
          label="Total Coverage"
          value={`${insights.totalCoverage}%`}
          description="Invoices with extracted total"
        />


        <InsightCard
          icon={ListTree}
          iconClass="
            text-orange-400
            bg-orange-500/10
          "
          label="Line Item Coverage"
          value={`${insights.lineItemCoverage}%`}
          description="Invoices with extracted items"
        />


        <InsightCard
          icon={ScanText}
          iconClass="
            text-cyan-400
            bg-cyan-500/10
          "
          label="OCR Coverage"
          value={`${insights.ocrCoverage}%`}
          description="Invoices with stored OCR text"
        />

      </section>


      {/* ====================================== */}
      {/* REAL AI METADATA */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <InsightCard
          icon={Gauge}
          iconClass="
            text-purple-400
            bg-purple-500/10
          "
          label="Average Confidence"
          value={
            backendAverageConfidence !==
            null
              ? `${backendAverageConfidence.toFixed(
                  1
                )}%`
              : "N/A"
          }
          description="Persisted AI extraction confidence"
        />


        <InsightCard
          icon={ShieldAlert}
          iconClass="
            text-amber-400
            bg-amber-500/10
          "
          label="Needs Review"
          value={
            needsReview
          }
          description="Invoices requiring manual review"
        />


        <InsightCard
          icon={Clock3}
          iconClass="
            text-blue-400
            bg-blue-500/10
          "
          label="Average Processing Time"
          value={
            aiMetrics
              .averageProcessingTime !==
            null
              ? `${(
                  aiMetrics
                    .averageProcessingTime /
                  1000
                ).toFixed(
                  2
                )} sec`
              : "N/A"
          }
          description="Average AI pipeline duration"
        />


        <InsightCard
          icon={Cpu}
          iconClass="
            text-indigo-400
            bg-indigo-500/10
          "
          label="Model Version"
          value={
            aiMetrics.primaryModel ||
            "N/A"
          }
          description={`${aiMetrics.metadataCount} invoice(s) with AI metadata`}
        />

      </section>


      {/* ====================================== */}
      {/* IMPORTANT NOTICE */}
      {/* ====================================== */}

      <section
        className="
          rounded-2xl
          border
          border-indigo-500/15
          bg-indigo-500/[0.04]
          p-5
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <BrainCircuit
            size={19}
            className="
              mt-0.5
              shrink-0
              text-indigo-400
            "
          />


          <div>

            <p
              className="
                text-sm
                font-medium
                text-indigo-200
              "
            >
              Completeness and confidence
              measure different things
            </p>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
              "
            >
              Completeness measures whether
              expected fields contain values.
              Confidence reflects the AI
              pipeline's persisted model
              confidence.
            </p>

          </div>

        </div>

      </section>


      {/* ====================================== */}
      {/* FIELD CONFIDENCE */}
      {/* ====================================== */}

      <section
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
            Average Field Confidence
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Average persisted model
            confidence for each extracted
            invoice field.
          </p>

        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {aiMetrics
            .fieldConfidence
            .map(
              (field) => (

                <ConfidenceRow
                  key={
                    field.key
                  }
                  label={
                    field.label
                  }
                  percentage={
                    field.percentage
                  }
                />

              )
            )}

        </div>

      </section>


      {/* ====================================== */}
      {/* COVERAGE + MISSING */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[1.35fr_0.65fr]
        "
      >

        <FieldCoverageChart
          data={
            insights.fieldCoverage
          }
        />


        <MissingFieldsChart
          data={
            insights
              .mostMissingFields
          }
          totalInvoices={
            insights.totalInvoices
          }
        />

      </section>


      {/* ====================================== */}
      {/* DISTRIBUTION + TABLE */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[0.7fr_1.3fr]
        "
      >

        <CompletenessDistribution
          data={
            insights
              .completenessDistribution
          }
        />


        <InvoiceCompletenessTable
          invoices={
            insights
              .invoiceCompleteness
          }
        />

      </section>


      {/* ====================================== */}
      {/* UNSUPPORTED V1 FEATURES */}
      {/* ====================================== */}

      <section
        className="
          rounded-2xl
          border
          border-dashed
          border-purple-500/20
          bg-purple-500/[0.03]
          p-6
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <BrainCircuit
            size={20}
            className="
              text-purple-400
            "
          />


          <div>

            <h2
              className="
                font-semibold
                text-white
              "
            >
              Advanced Model Intelligence
            </h2>


            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-gray-500
              "
            >
             
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


// ==========================================
// FIELD CONFIDENCE ROW
// ==========================================

function ConfidenceRow({
  label,
  percentage,
}) {
  const available =
    typeof percentage ===
    "number";


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

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >

        <span
          className="
            text-sm
            text-gray-400
          "
        >
          {label}
        </span>


        <span
          className={`
            text-sm
            font-semibold
            ${
              !available
                ? "text-gray-600"
                : percentage >=
                  85
                ? "text-emerald-400"
                : percentage >=
                  75
                ? "text-amber-400"
                : "text-red-400"
            }
          `}
        >
          {available
            ? `${percentage}%`
            : "N/A"}
        </span>

      </div>


      {available && (
        <div
          className="
            mt-3
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
              bg-indigo-500
            "
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>
      )}

    </div>
  );
}


// ==========================================
// HEADER
// ==========================================

function PageHeader() {
  return (
    <section>

      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.18em]
          text-purple-400
        "
      >
        Artificial Intelligence
      </p>


      <h1
        className="
          mt-2
          text-3xl
          font-bold
          tracking-tight
          text-white
        "
      >
        AI Insights
      </h1>


      <p
        className="
          mt-2
          max-w-2xl
          text-sm
          leading-6
          text-gray-500
        "
      >
        Measure extraction completeness,
        field coverage, confidence and
        missing-data patterns across your
        processed invoices.
      </p>

    </section>
  );
}


// ==========================================
// TABLE
// ==========================================

function InvoiceCompletenessTable({
  invoices = [],
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
          border-b
          border-white/[0.07]
          p-6
        "
      >

        <h2
          className="
            font-semibold
            text-white
          "
        >
          Invoice Completeness
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Extracted-field coverage for
          each stored invoice.
        </p>

      </div>


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
                Invoice
              </th>

              <th className="px-5 py-4">
                Vendor
              </th>

              <th className="px-5 py-4">
                Fields
              </th>

              <th className="px-5 py-4">
                Completeness
              </th>

            </tr>

          </thead>


          <tbody>

            {invoices.map(
              (invoice) => (

                <tr
                  key={
                    invoice.id
                  }
                  className="
                    border-b
                    border-white/[0.05]
                  "
                >

                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      font-medium
                      text-gray-200
                    "
                  >
                    {
                      invoice.filename
                    }
                  </td>


                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      text-gray-400
                    "
                  >
                    {
                      invoice.vendor
                    }
                  </td>


                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      text-gray-500
                    "
                  >
                    {
                      invoice
                        .extractedFields
                    }
                    /
                    {
                      invoice.totalFields
                    }
                  </td>


                  <td
                    className="
                      min-w-[180px]
                      px-5
                      py-4
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
                          h-1.5
                          flex-1
                          overflow-hidden
                          rounded-full
                          bg-white/[0.05]
                        "
                      >

                        <div
                          className="
                            h-full
                            rounded-full
                            bg-indigo-500
                          "
                          style={{
                            width: `${invoice.percentage}%`,
                          }}
                        />

                      </div>


                      <span
                        className="
                          w-10
                          text-right
                          text-xs
                          font-medium
                          text-gray-300
                        "
                      >
                        {
                          invoice.percentage
                        }
                        %
                      </span>

                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


// ==========================================
// FIELD LABEL
// ==========================================

function formatFieldName(
  key
) {
  const labels = {
    vendorName:
      "Vendor Name",

    invoiceNumber:
      "Invoice Number",

    invoiceDate:
      "Invoice Date",

    customerName:
      "Customer Name",

    customerAddress:
      "Customer Address",

    customerGstin:
      "Customer GSTIN",

    items:
      "Line Items",

    subtotal:
      "Subtotal",

    discount:
      "Discount",

    taxRate:
      "Tax Rate",

    tax:
      "Tax",

    total:
      "Total Amount",
  };


  return labels[key] || key;
}


// ==========================================
// SKELETON
// ==========================================

function InsightsSkeleton() {
  return (
    <div className="space-y-8">

      <PageHeader />


      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-6
        "
      >

        {Array.from({
          length: 6,
        }).map(
          (_, index) => (

            <div
              key={index}
              className="
                h-40
                animate-pulse
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#111827]
              "
            />

          )
        )}

      </div>


      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        "
      >

        {[1, 2].map(
          (item) => (

            <div
              key={item}
              className="
                h-[420px]
                animate-pulse
                rounded-2xl
                bg-[#111827]
              "
            />

          )
        )}

      </div>

    </div>
  );
}