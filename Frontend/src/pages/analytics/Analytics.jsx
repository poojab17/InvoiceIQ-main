import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FileText,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Building2,
  Calculator,
  BarChart3,
  AlertCircle,
  RefreshCw,
  BrainCircuit,
  CheckCircle2,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getInvoices,
  getInvoiceStats,
} from "../../services/invoiceApi";

import {
  calculateInvoiceAnalytics,
  formatCurrency,
} from "../../utils/analyticsUtils";

import AnalyticsCard from "../../components/analytics/AnalyticsCard";
import MonthlyInvoicesChart from "../../components/analytics/MonthlyInvoicesChart";
import MonthlySpendChart from "../../components/analytics/MonthlySpendChart";
import VendorDistribution from "../../components/analytics/VendorDistribution";
import AmountTrendChart from "../../components/analytics/AmountTrendChart";


const PAGE_LIMIT = 50;


export default function Analytics() {
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
  // FETCH ALL INVOICE PAGES
  // ==========================================

  const fetchAllInvoices =
    useCallback(async () => {
      /*
        Backend permits maximum limit = 50.

        Fetch first page, inspect totalPages,
        then retrieve remaining pages.
      */

      const firstResponse =
        await getInvoices({
          page: 1,
          limit: PAGE_LIMIT,
          sort: "oldest",
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
            sort: "oldest",
          })
        );
      }


      const responses =
        await Promise.all(
          requests
        );


      const remainingInvoices =
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
        ...remainingInvoices,
      ];
    }, []);


  // ==========================================
  // LOAD ANALYTICS
  // ==========================================

  const loadAnalytics =
    useCallback(async () => {
      try {
        setLoading(true);

        setError("");


        const [
          invoiceData,
          statsResponse,
        ] =
          await Promise.all([
            fetchAllInvoices(),
            getInvoiceStats(),
          ]);


        setInvoices(
          invoiceData
        );


        setStats(
          statsResponse?.stats ||
            null
        );

      } catch (err) {
        console.error(
          "Analytics load error:",
          err
        );


        setError(
          err?.message ||
            "Unable to load analytics."
        );

      } finally {
        setLoading(false);
      }
    }, [fetchAllInvoices]);


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);


  // ==========================================
  // LOCAL ANALYTICS
  // ==========================================

  const analytics =
    useMemo(
      () =>
        calculateInvoiceAnalytics(
          invoices
        ),
      [invoices]
    );


  // ==========================================
  // AI METADATA ANALYTICS
  // ==========================================

  const aiAnalytics =
    useMemo(() => {
      const withMetadata =
        invoices.filter(
          (invoice) =>
            typeof invoice
              ?.aiMetadata
              ?.overallConfidence ===
            "number"
        );


      const confidenceValues =
        withMetadata.map(
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


      const processedCount =
        invoices.filter(
          (invoice) =>
            invoice?.status ===
            "processed"
        ).length;


      const needsReviewCount =
        invoices.filter(
          (invoice) =>
            invoice?.status ===
            "needs_review"
        ).length;


      const verifiedCount =
        invoices.filter(
          (invoice) =>
            invoice?.status ===
            "verified"
        ).length;


      return {
        metadataCount:
          withMetadata.length,

        averageConfidence,

        averageProcessingTime,

        processedCount,

        needsReviewCount,

        verifiedCount,
      };

    }, [invoices]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <AnalyticsSkeleton />
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

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-red-500/10
            "
          >
            <AlertCircle
              size={22}
              className="
                text-red-400
              "
            />
          </div>


          <h2
            className="
              mt-5
              text-lg
              font-semibold
              text-white
            "
          >
            Analytics unavailable
          </h2>


          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-gray-400
            "
          >
            {error}
          </p>


          <button
            type="button"
            onClick={
              loadAnalytics
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
              transition
              hover:bg-red-500/20
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
            px-6
          "
        >

          <div
            className="
              max-w-md
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-indigo-500/10
              "
            >
              <BarChart3
                size={30}
                className="
                  text-indigo-400
                "
              />
            </div>


            <h2
              className="
                mt-5
                text-xl
                font-semibold
                text-white
              "
            >
              No analytics yet
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500
              "
            >
              Analytics will appear
              automatically after you
              process invoices.
            </p>


            <Link
              to="/upload"
              className="
                mt-6
                inline-flex
                rounded-xl
                bg-indigo-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-indigo-500
              "
            >
              Upload your first invoice
            </Link>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // BACKEND AUTHORITATIVE STATS
  // ==========================================

  const totalInvoices =
    stats?.totalInvoices ??
    analytics.totalInvoices;


  const processedInvoices =
    stats?.processedInvoices ??
    aiAnalytics.processedCount;


  const needsReviewInvoices =
    stats
      ?.needsReviewInvoices ??
    aiAnalytics.needsReviewCount;


  const averageConfidence =
    typeof stats
      ?.averageConfidencePercentage ===
    "number"
      ? stats.averageConfidencePercentage
      : aiAnalytics
          .averageConfidence !==
        null
      ? aiAnalytics.averageConfidence *
        100
      : null;


  const todayUploads =
    stats?.todayUploads ?? 0;


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
            loadAnalytics
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
      {/* BACKEND STATS */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-5
        "
      >

        <AnalyticsCard
          icon={FileText}
          iconClass="
            text-blue-400
            bg-blue-500/10
          "
          label="Total Invoices"
          value={
            totalInvoices
          }
          description="Stored invoices for your account"
        />


        <AnalyticsCard
          icon={CheckCircle2}
          iconClass="
            text-emerald-400
            bg-emerald-500/10
          "
          label="Processed"
          value={
            processedInvoices
          }
          description="Successfully processed invoices"
        />


        <AnalyticsCard
          icon={ShieldAlert}
          iconClass="
            text-amber-400
            bg-amber-500/10
          "
          label="Needs Review"
          value={
            needsReviewInvoices
          }
          description="Invoices requiring review"
        />


        <AnalyticsCard
          icon={BrainCircuit}
          iconClass="
            text-purple-400
            bg-purple-500/10
          "
          label="Average Confidence"
          value={
            averageConfidence !==
            null
              ? `${averageConfidence.toFixed(
                  1
                )}%`
              : "Not available"
          }
          description="Backend AI extraction confidence"
        />


        <AnalyticsCard
          icon={UploadCloud}
          iconClass="
            text-cyan-400
            bg-cyan-500/10
          "
          label="Today's Uploads"
          value={
            todayUploads
          }
          description="Invoices uploaded today"
        />

      </section>


      {/* ====================================== */}
      {/* FINANCIAL KPI GRID */}
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

        <AnalyticsCard
          icon={IndianRupee}
          iconClass="
            text-emerald-400
            bg-emerald-500/10
          "
          label="Total Amount"
          value={
            formatCurrency(
              analytics.totalAmount
            )
          }
          description={`${analytics.extractedAmountCount} valid invoice total(s)`}
        />


        <AnalyticsCard
          icon={Calculator}
          iconClass="
            text-orange-400
            bg-orange-500/10
          "
          label="Average Amount"
          value={
            formatCurrency(
              analytics.averageAmount
            )
          }
          description="Missing totals are ignored"
        />


        <AnalyticsCard
          icon={TrendingUp}
          iconClass="
            text-purple-400
            bg-purple-500/10
          "
          label="Highest Invoice"
          value={
            analytics.highestInvoice
              ? formatCurrency(
                  analytics
                    .highestInvoice
                    .parsedAmount
                )
              : "Not available"
          }
          description={
            analytics.highestInvoice
              ?.vendor?.name ||
            "Vendor not extracted"
          }
        />


        <AnalyticsCard
          icon={TrendingDown}
          iconClass="
            text-cyan-400
            bg-cyan-500/10
          "
          label="Lowest Invoice"
          value={
            analytics.lowestInvoice
              ? formatCurrency(
                  analytics
                    .lowestInvoice
                    .parsedAmount
                )
              : "Not available"
          }
          description={
            analytics.lowestInvoice
              ?.vendor?.name ||
            "Vendor not extracted"
          }
        />


        <AnalyticsCard
          icon={Building2}
          iconClass="
            text-pink-400
            bg-pink-500/10
          "
          label="Top Vendor"
          value={
            analytics
              .mostFrequentVendor
              ?.name ||
            "Not available"
          }
          description={
            analytics
              .mostFrequentVendor
              ? `${analytics.mostFrequentVendor.count} invoice(s)`
              : "No vendor extracted"
          }
        />


        <AnalyticsCard
          icon={BrainCircuit}
          iconClass="
            text-indigo-400
            bg-indigo-500/10
          "
          label="AI Metadata Coverage"
          value={`${Math.round(
            (
              aiAnalytics.metadataCount /
              invoices.length
            ) * 100
          )}%`}
          description={`${aiAnalytics.metadataCount} of ${invoices.length} invoices`}
        />

      </section>


      {/* ====================================== */}
      {/* DATA QUALITY NOTICE */}
      {/* ====================================== */}

      {analytics
        .extractedAmountCount <
        analytics
          .totalInvoices && (

        <section
          className="
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-amber-500/15
            bg-amber-500/[0.04]
            p-5
            sm:flex-row
            sm:items-center
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-amber-500/10
            "
          >
            <AlertCircle
              size={19}
              className="
                text-amber-400
              "
            />
          </div>


          <div>

            <p
              className="
                text-sm
                font-medium
                text-amber-200
              "
            >
              Some invoice totals
              were not extracted
            </p>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
              "
            >
              Financial analytics
              ignore invoices without
              a valid total amount.
            </p>

          </div>

        </section>
      )}


      {/* ====================================== */}
      {/* PRIMARY CHARTS */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        "
      >

        <MonthlyInvoicesChart
          data={
            analytics.monthlyData
          }
        />


        <MonthlySpendChart
          data={
            analytics.monthlyData
          }
        />

      </section>


      {/* ====================================== */}
      {/* SECONDARY CHARTS */}
      {/* ====================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[0.75fr_1.25fr]
        "
      >

        <VendorDistribution
          data={
            analytics.vendorDistribution
          }
        />


        <AmountTrendChart
          data={
            analytics.amountTrend
          }
        />

      </section>


      {/* ====================================== */}
      {/* AI PIPELINE METRICS */}
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
            AI Processing Analytics
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Real metadata persisted by
            InvoiceIQ's AI pipeline.
          </p>

        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <MiniMetric
            label="Average Confidence"
            value={
              averageConfidence !==
              null
                ? `${averageConfidence.toFixed(
                    1
                  )}%`
                : "N/A"
            }
          />


          <MiniMetric
            label="Average Processing Time"
            value={
              aiAnalytics
                .averageProcessingTime !==
              null
                ? `${(
                    aiAnalytics
                      .averageProcessingTime /
                    1000
                  ).toFixed(
                    2
                  )} sec`
                : "N/A"
            }
          />


          <MiniMetric
            label="Needs Review"
            value={
              needsReviewInvoices
            }
          />


          <MiniMetric
            label="Metadata Coverage"
            value={`${Math.round(
              (
                aiAnalytics
                  .metadataCount /
                invoices.length
              ) * 100
            )}%`}
          />

        </div>

      </section>


      {/* ====================================== */}
      {/* FINANCIAL COVERAGE */}
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

        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                font-semibold
                text-white
              "
            >
              Financial Data Coverage
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Percentage of invoices
              containing a valid extracted
              total amount.
            </p>

          </div>


          <span
            className="
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.03]
              px-3
              py-1.5
              text-sm
              font-medium
              text-gray-300
            "
          >
            {getCoveragePercentage(
              analytics
                .extractedAmountCount,
              analytics.totalInvoices
            )}
            %
          </span>

        </div>


        <div
          className="
            mt-5
            h-2
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
              transition-all
              duration-500
            "
            style={{
              width: `${getCoveragePercentage(
                analytics
                  .extractedAmountCount,
                analytics
                  .totalInvoices
              )}%`,
            }}
          />

        </div>


        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-x-6
            gap-y-2
            text-xs
            text-gray-500
          "
        >

          <span>
            Total invoices:{" "}
            <strong
              className="
                font-medium
                text-gray-300
              "
            >
              {
                analytics
                  .totalInvoices
              }
            </strong>
          </span>


          <span>
            Valid totals:{" "}
            <strong
              className="
                font-medium
                text-gray-300
              "
            >
              {
                analytics
                  .extractedAmountCount
              }
            </strong>
          </span>


          <span>
            Missing totals:{" "}
            <strong
              className="
                font-medium
                text-gray-300
              "
            >
              {analytics
                .totalInvoices -
                analytics
                  .extractedAmountCount}
            </strong>
          </span>

        </div>

      </section>

    </div>
  );
}


// ==========================================
// MINI METRIC
// ==========================================

function MiniMetric({
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

      <p
        className="
          text-xs
          text-gray-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-2
          text-xl
          font-semibold
          text-white
        "
      >
        {value}
      </p>

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
          text-indigo-400
        "
      >
        Intelligence
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
        Analytics
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
        Understand invoice volume,
        spending patterns, vendor
        activity and AI extraction
        performance.
      </p>

    </section>
  );
}


// ==========================================
// COVERAGE
// ==========================================

function getCoveragePercentage(
  extracted,
  total
) {
  if (!total) {
    return 0;
  }


  return Math.round(
    (extracted / total) *
      100
  );
}


// ==========================================
// SKELETON
// ==========================================

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">

      <PageHeader />


      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-5
        "
      >

        {Array.from({
          length: 5,
        }).map(
          (_, index) => (

            <div
              key={index}
              className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#111827]
                p-5
              "
            >

              <div
                className="
                  h-10
                  w-10
                  animate-pulse
                  rounded-xl
                  bg-white/[0.06]
                "
              />


              <div
                className="
                  mt-5
                  h-3
                  w-24
                  animate-pulse
                  rounded
                  bg-white/[0.05]
                "
              />


              <div
                className="
                  mt-3
                  h-7
                  w-32
                  animate-pulse
                  rounded
                  bg-white/[0.07]
                "
              />

            </div>

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
                h-[360px]
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

    </div>
  );
}