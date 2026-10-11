import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  UploadCloud,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import UploadZone from "../../components/upload/UploadZone";
import UploadProgress from "../../components/upload/UploadProgress";
import UploadedFileCard from "../../components/upload/UploadedFileCard";
import AIWorkflow from "../../components/upload/AIWorkflow";
import UploadSuccess from "../../components/upload/UploadSuccess";

import InvoiceAnalysis from "../../components/invoice/InvoiceAnalysis";
import InvoiceTable from "../../components/invoice/InvoiceTable";

import {
  processInvoices,
  getInvoices,
  getInvoiceStats,
} from "../../services/invoiceApi";


export default function Dashboard() {
  const navigate =
    useNavigate();


  // ==========================================
  // UPLOAD
  // ==========================================

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(-1);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    completed,
    setCompleted,
  ] = useState(false);

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  const [
    processedInvoice,
    setProcessedInvoice,
  ] = useState(null);


  // ==========================================
  // RECENT INVOICES
  // ==========================================

  const [
    invoices,
    setInvoices,
  ] = useState([]);

  const [
    loadingInvoices,
    setLoadingInvoices,
  ] = useState(true);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState("");


  // ==========================================
  // STATS
  // ==========================================

  const [
    stats,
    setStats,
  ] = useState({
    totalInvoices: 0,
    processedInvoices: 0,
    needsReviewInvoices: 0,
    averageConfidence: 0,
    averageConfidencePercentage: 0,
    todayUploads: 0,
  });

  const [
    loadingStats,
    setLoadingStats,
  ] = useState(true);

  const [
    statsError,
    setStatsError,
  ] = useState("");


  // ==========================================
  // FETCH STATS
  // ==========================================

  const fetchStats =
    useCallback(async () => {
      try {
        setLoadingStats(true);
        setStatsError("");

        const response =
          await getInvoiceStats();

        const realStats =
          response?.stats;

        if (!realStats) {
          throw new Error(
            "Statistics were not returned."
          );
        }


        setStats({
          totalInvoices:
            realStats.totalInvoices ??
            0,

          processedInvoices:
            realStats.processedInvoices ??
            0,

          needsReviewInvoices:
            realStats.needsReviewInvoices ??
            0,

          averageConfidence:
            realStats.averageConfidence ??
            0,

          averageConfidencePercentage:
            realStats.averageConfidencePercentage ??
            0,

          todayUploads:
            realStats.todayUploads ??
            0,
        });

      } catch (error) {
        console.error(
          "Dashboard stats error:",
          error
        );

        setStatsError(
          error?.message ||
            "Unable to load statistics."
        );

      } finally {
        setLoadingStats(false);
      }
    }, []);


  // ==========================================
  // FETCH RECENT INVOICES
  // ==========================================

  const fetchInvoices =
    useCallback(async () => {
      try {
        setLoadingInvoices(
          true
        );

        setInvoiceError("");


        const response =
          await getInvoices({
            sort: "newest",
            page: 1,
            limit: 6,
          });


        const realInvoices =
          Array.isArray(
            response?.invoices
          )
            ? response.invoices
            : [];


        setInvoices(
          realInvoices
        );


        setProcessedInvoice(
          (current) =>
            current ||
            realInvoices[0] ||
            null
        );

      } catch (error) {
        console.error(
          "Dashboard invoice error:",
          error
        );

        setInvoiceError(
          error?.message ||
            "Unable to load invoices."
        );

      } finally {
        setLoadingInvoices(
          false
        );
      }
    }, []);


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchStats();
    fetchInvoices();
  }, [
    fetchStats,
    fetchInvoices,
  ]);


  // ==========================================
  // UPLOAD
  // ==========================================

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    let cancelled = false;


    const uploadInvoice =
      async () => {
        try {
          setProcessing(true);
          setCompleted(false);
          setUploadError("");
          setProgress(0);
          setCurrentStep(0);


          const response =
            await processInvoices(
              selectedFile,

              (percent) => {
                if (cancelled) {
                  return;
                }

                setProgress(
                  Math.min(
                    Math.round(
                      percent *
                        0.7
                    ),
                    70
                  )
                );
              }
            );


          if (cancelled) {
            return;
          }


          setProgress(80);
          setCurrentStep(2);

          await delay(250);

          if (cancelled) return;


          setProgress(90);
          setCurrentStep(3);

          await delay(250);

          if (cancelled) return;


          setProgress(95);
          setCurrentStep(4);

          await delay(250);

          if (cancelled) return;


          const successfulInvoices =
            Array.isArray(
              response?.invoices
            )
              ? response.invoices
              : [];


          const duplicates =
            Array.isArray(
              response?.skippedDuplicates
            )
              ? response.skippedDuplicates
              : [];


          const failed =
            Array.isArray(
              response?.failedInvoices
            )
              ? response.failedInvoices
              : [];


          // Duplicate warnings
          duplicates.forEach(
            (duplicate) => {
              toast(
                duplicate?.reason ||
                  `${duplicate?.filename || "Invoice"} already exists`,
                {
                  icon: "⚠️",
                }
              );
            }
          );


          // Failed warnings
          failed.forEach(
            (item) => {
              toast.error(
                item?.error ||
                  `${item?.filename || "Invoice"} could not be processed`
              );
            }
          );


          // No successful save
          if (
            successfulInvoices.length ===
            0
          ) {
            setProgress(100);
            setCurrentStep(5);

            if (
              duplicates.length > 0
            ) {
              setUploadError(
                "This invoice already exists in your account."
              );
            } else {
              setUploadError(
                "No invoice could be processed."
              );
            }

            return;
          }


          const invoice =
            successfulInvoices[0];


          setProcessedInvoice(
            invoice
          );


          setInvoices(
            (previous) => {
              const clean =
                previous.filter(
                  (item) =>
                    item._id !==
                    invoice._id
                );

              return [
                invoice,
                ...clean,
              ].slice(0, 6);
            }
          );


          setProgress(100);
          setCurrentStep(5);
          setCompleted(true);


          if (
            invoice?.status ===
            "needs_review"
          ) {
            toast(
              "Invoice processed — manual review recommended",
              {
                icon: "⚠️",
              }
            );
          } else {
            toast.success(
              "Invoice processed successfully"
            );
          }


          await fetchStats();

        } catch (error) {
          if (cancelled) {
            return;
          }


          console.error(
            "Dashboard upload error:",
            error
          );


          const message =
            error?.message ||
            "Invoice processing failed.";


          setUploadError(
            message
          );

          toast.error(message);

        } finally {
          if (!cancelled) {
            setProcessing(false);
          }
        }
      };


    uploadInvoice();


    return () => {
      cancelled = true;
    };

  }, [
    selectedFile,
    fetchStats,
  ]);


  // ==========================================
  // RESET
  // ==========================================

  const handleResetUpload = () => {
    setSelectedFile(null);
    setProgress(0);
    setCurrentStep(-1);
    setCompleted(false);
    setProcessing(false);
    setUploadError("");

    setProcessedInvoice(
      invoices[0] ||
      null
    );
  };


  // ==========================================
  // VIEW
  // ==========================================

  const handleViewInvoice = (
    id
  ) => {
    if (!id) {
      return;
    }

    navigate(
      `/invoices/${id}`
    );
  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleInvoiceDeleted =
    async (deletedId) => {
      const remaining =
        invoices.filter(
          (invoice) =>
            invoice._id !==
            deletedId
        );


      setInvoices(remaining);


      if (
        processedInvoice?._id ===
        deletedId
      ) {
        setProcessedInvoice(
          remaining[0] ||
          null
        );
      }


      await fetchStats();

      /*
        Pull latest six again so Dashboard
        remains correct after deleting one
        of the visible rows.
      */

      await fetchInvoices();
    };


  // ==========================================
  // CARDS
  // ==========================================

  const cards = [
    {
      label:
        "Total Invoices",

      value: loadingStats
        ? "..."
        : stats.totalInvoices,

      description:
        "Invoices stored for your account",

      icon: FileText,

      iconClass:
        "bg-blue-500/10 text-blue-400",
    },

    {
      label:
        "Processed",

      value: loadingStats
        ? "..."
        : stats.processedInvoices,

      description:
        "Invoices processed successfully",

      icon: CheckCircle2,

      iconClass:
        "bg-emerald-500/10 text-emerald-400",
    },

    {
      label:
        "Needs Review",

      value: loadingStats
        ? "..."
        : stats.needsReviewInvoices,

      description:
        "Invoices requiring manual review",

      icon: AlertTriangle,

      iconClass:
        "bg-amber-500/10 text-amber-400",
    },

    {
      label:
        "Average Confidence",

      value: loadingStats
        ? "..."
        : `${Number(
            stats.averageConfidencePercentage ||
              0
          ).toFixed(1)}%`,

      description:
        "Average AI extraction confidence",

      icon: BrainCircuit,

      iconClass:
        "bg-purple-500/10 text-purple-400",
    },

    {
      label:
        "Today's Uploads",

      value: loadingStats
        ? "..."
        : stats.todayUploads,

      description:
        "Invoices uploaded today",

      icon: UploadCloud,

      iconClass:
        "bg-cyan-500/10 text-cyan-400",
    },
  ];


  return (
    <div className="space-y-8">

      {/* Header */}
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
          Overview
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
          Dashboard
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
          Monitor invoice processing,
          AI extraction quality and
          documents requiring review.
        </p>

      </section>


      {/* Stats Error */}
      {statsError && (
        <div
          className="
            rounded-xl
            border
            border-amber-500/20
            bg-amber-500/[0.05]
            p-4
          "
        >
          <p
            className="
              text-sm
              text-amber-300
            "
          >
            {statsError}
          </p>
        </div>
      )}


      {/* Cards */}
      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-5
        "
      >

        {cards.map(
          (card) => (
            <MetricCard
              key={card.label}
              {...card}
            />
          )
        )}

      </section>


      {/* Error */}
      {invoiceError && (
        <div
          className="
            rounded-xl
            border
            border-red-500/20
            bg-red-500/[0.05]
            p-4
          "
        >
          <p
            className="
              text-sm
              text-red-400
            "
          >
            {invoiceError}
          </p>
        </div>
      )}


      {/* Workspace */}
      <section
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[0.65fr_1.35fr]
        "
      >

        {/* Upload */}
        <div className="space-y-5">

          <UploadZone
            selectedFile={
              selectedFile
            }
            setSelectedFile={
              setSelectedFile
            }
          />


          {selectedFile &&
            !completed &&
            !uploadError && (
              <>

                <UploadProgress
                  progress={
                    progress
                  }
                />


                {progress >= 70 && (
                  <>

                    <UploadedFileCard
                      file={
                        selectedFile
                      }
                      progress={
                        progress
                      }
                      onRemove={
                        handleResetUpload
                      }
                    />


                    <AIWorkflow
                      currentStep={
                        currentStep
                      }
                    />

                  </>
                )}

              </>
            )}


          {uploadError && (
            <div
              className="
                rounded-2xl
                border
                border-amber-500/20
                bg-amber-500/[0.05]
                p-5
              "
            >

              <p
                className="
                  font-semibold
                  text-amber-300
                "
              >
                Invoice not saved
              </p>


              <p
                className="
                  mt-2
                  text-sm
                  text-gray-400
                "
              >
                {uploadError}
              </p>


              <button
                type="button"
                onClick={
                  handleResetUpload
                }
                className="
                  mt-4
                  rounded-lg
                  bg-amber-500/10
                  px-4
                  py-2
                  text-sm
                  text-amber-300
                "
              >
                Choose another invoice
              </button>

            </div>
          )}


          {selectedFile &&
            completed &&
            processedInvoice && (
              <UploadSuccess
                file={
                  selectedFile
                }
                onView={() =>
                  handleViewInvoice(
                    processedInvoice._id
                  )
                }
                onUploadAgain={
                  handleResetUpload
                }
              />
            )}

        </div>


        {/* AI Analysis */}
        <div>

          {processing &&
          !processedInvoice ? (

            <div
              className="
                flex
                min-h-[360px]
                items-center
                justify-center
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#111827]
              "
            >

              <div className="text-center">

                <div
                  className="
                    mx-auto
                    h-10
                    w-10
                    animate-spin
                    rounded-full
                    border-2
                    border-gray-700
                    border-t-purple-400
                  "
                />


                <p
                  className="
                    mt-5
                    font-medium
                    text-white
                  "
                >
                  Processing invoice
                </p>


                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-500
                  "
                >
                  OCR and AI extraction
                  are running...
                </p>

              </div>

            </div>

          ) : (

            <InvoiceAnalysis
              invoice={
                processedInvoice
              }
            />

          )}

        </div>

      </section>


      {/* Recent Invoices Header */}
      <section>

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              Recent Invoices
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Latest processed documents
            </p>

          </div>


          <Link
            to="/invoices"
            className="
              text-sm
              font-medium
              text-indigo-400
              transition
              hover:text-indigo-300
            "
          >
            View all invoices →
          </Link>

        </div>


        <InvoiceTable
          invoices={
            invoices
          }
          loading={
            loadingInvoices
          }
          compact
          onViewInvoice={
            handleViewInvoice
          }
          onInvoiceDeleted={
            handleInvoiceDeleted
          }
        />

      </section>

    </div>
  );
}


// ==========================================
// METRIC CARD
// ==========================================

function MetricCard({
  icon: Icon,
  iconClass,
  label,
  value,
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#111827]
        p-5
        transition
        hover:border-white/[0.12]
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={20} />
      </div>


      <p
        className="
          mt-5
          text-sm
          text-gray-400
        "
      >
        {label}
      </p>


      <h2
        className="
          mt-2
          text-2xl
          font-bold
          text-white
        "
      >
        {value}
      </h2>


      <p
        className="
          mt-2
          text-xs
          leading-5
          text-gray-600
        "
      >
        {description}
      </p>

    </div>
  );
}


function delay(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}