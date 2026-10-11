import {
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import UploadHero from "../../components/upload/UploadHero";
import UploadZone from "../../components/upload/UploadZone";
import UploadProgress from "../../components/upload/UploadProgress";
import AIWorkflow from "../../components/upload/AIWorkflow";

import {
  processInvoices,
} from "../../services/invoiceApi";


export default function Upload() {
  const navigate =
    useNavigate();

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState([]);

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
    error,
    setError,
  ] = useState("");

  const [
    processedInvoices,
    setProcessedInvoices,
  ] = useState([]);

  const [
    duplicates,
    setDuplicates,
  ] = useState([]);

  const [
    failedInvoices,
    setFailedInvoices,
  ] = useState([]);


  // ==========================================
  // PROCESS
  // ==========================================

  const handleProcessInvoices =
    async () => {
      if (
        selectedFiles.length ===
        0
      ) {
        toast.error(
          "Please select at least one invoice."
        );

        return;
      }


      try {
        setProcessing(true);

        setCompleted(false);

        setError("");

        setProcessedInvoices([]);

        setDuplicates([]);

        setFailedInvoices([]);

        setProgress(0);

        setCurrentStep(0);


        const response =
          await processInvoices(
            selectedFiles,

            (percent) => {
              const value =
                Math.min(
                  Math.round(
                    percent * 0.7
                  ),
                  70
                );

              setProgress(value);
            }
          );


        // Visual stages
        setProgress(80);
        setCurrentStep(2);

        await delay(250);


        setProgress(90);
        setCurrentStep(3);

        await delay(250);


        setProgress(95);
        setCurrentStep(4);

        await delay(250);


        // ======================================
        // REAL BACKEND RESPONSE
        // ======================================

        const successful =
          Array.isArray(
            response?.invoices
          )
            ? response.invoices
            : [];


        const skipped =
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


        setProcessedInvoices(
          successful
        );

        setDuplicates(
          skipped
        );

        setFailedInvoices(
          failed
        );


        setProgress(100);

        setCurrentStep(5);

        setCompleted(true);


        if (
          successful.length > 0
        ) {
          toast.success(
            `${successful.length} invoice${
              successful.length === 1
                ? ""
                : "s"
            } processed successfully`
          );
        }


        if (
          skipped.length > 0
        ) {
          toast(
            `${skipped.length} duplicate invoice${
              skipped.length === 1
                ? ""
                : "s"
            } skipped`,
            {
              icon: "⚠️",
            }
          );
        }


        if (
          failed.length > 0
        ) {
          toast.error(
            `${failed.length} invoice${
              failed.length === 1
                ? ""
                : "s"
            } failed`
          );
        }


        if (
          successful.length ===
            0 &&
          skipped.length === 0 &&
          failed.length === 0
        ) {
          setError(
            "No processing result was returned."
          );
        }

      } catch (err) {
        console.error(
          "Invoice batch processing error:",
          err
        );


        const message =
          err?.message ||
          "Invoice processing failed";


        setError(message);

        toast.error(message);

      } finally {
        setProcessing(false);
      }
    };


  // ==========================================
  // RESET
  // ==========================================

  const handleReset = () => {
    setSelectedFiles([]);

    setProgress(0);

    setCurrentStep(-1);

    setProcessing(false);

    setCompleted(false);

    setProcessedInvoices([]);

    setDuplicates([]);

    setFailedInvoices([]);

    setError("");
  };


  return (
    <div className="space-y-8">

      <UploadHero />


      {/* ====================================== */}
      {/* MULTIPLE UPLOAD ZONE */}
      {/* ====================================== */}

      {!completed && (
        <UploadZone
          multiple={true}
          selectedFiles={
            selectedFiles
          }
          setSelectedFiles={
            setSelectedFiles
          }
        />
      )}


      {/* Process Button */}
      {selectedFiles.length >
        0 &&
        !processing &&
        !completed && (

          <button
            type="button"
            onClick={
              handleProcessInvoices
            }
            className="
              w-full
              rounded-xl
              bg-indigo-600
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-indigo-500
            "
          >
            Process{" "}
            {selectedFiles.length}{" "}
            Invoice
            {selectedFiles.length ===
            1
              ? ""
              : "s"}
          </button>

        )}


      {/* Processing */}
      {processing && (
        <div className="space-y-5">

          <UploadProgress
            progress={
              progress
            }
          />


          <AIWorkflow
            currentStep={
              currentStep
            }
          />


          <div
            className="
              rounded-xl
              border
              border-white/[0.07]
              bg-[#111827]
              p-4
            "
          >
            <p
              className="
                text-sm
                text-gray-400
              "
            >
              Processing{" "}
              <span
                className="
                  font-medium
                  text-white
                "
              >
                {selectedFiles.length}
              </span>{" "}
              invoice
              {selectedFiles.length ===
              1
                ? ""
                : "s"}
              ...
            </p>
          </div>

        </div>
      )}


      {/* Fatal Error */}
      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/[0.05]
            p-5
          "
        >

          <div
            className="
              flex
              gap-3
            "
          >
            <CircleX
              size={21}
              className="
                mt-0.5
                shrink-0
                text-red-400
              "
            />


            <div>

              <h2
                className="
                  font-semibold
                  text-red-300
                "
              >
                Invoice processing failed
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

            </div>

          </div>


          <button
            type="button"
            onClick={
              handleReset
            }
            className="
              mt-5
              rounded-xl
              bg-red-500/10
              px-4
              py-2
              text-sm
              text-red-300
            "
          >
            Reset Upload
          </button>

        </div>
      )}


      {/* ====================================== */}
      {/* FINAL RESULTS */}
      {/* ====================================== */}

      {completed && (
        <div className="space-y-6">

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#111827]
              p-6
            "
          >

            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              Processing Complete
            </h2>


            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              InvoiceIQ finished processing
              this upload batch.
            </p>


            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-3
              "
            >

              <SummaryCard
                title="Processed"
                value={
                  processedInvoices.length
                }
                className="
                  border-emerald-500/20
                  bg-emerald-500/[0.05]
                  text-emerald-300
                "
              />


              <SummaryCard
                title="Duplicates"
                value={
                  duplicates.length
                }
                className="
                  border-amber-500/20
                  bg-amber-500/[0.05]
                  text-amber-300
                "
              />


              <SummaryCard
                title="Failed"
                value={
                  failedInvoices.length
                }
                className="
                  border-red-500/20
                  bg-red-500/[0.05]
                  text-red-300
                "
              />

            </div>

          </div>


          {/* Successful */}
          {processedInvoices.length >
            0 && (

            <ResultSection
              icon={CheckCircle2}
              iconClass="text-emerald-400"
              title="Processed Invoices"
            >

              {processedInvoices.map(
                (invoice) => (

                  <ResultRow
                    key={
                      invoice._id
                    }
                    title={
                      invoice.filename ||
                      "Invoice"
                    }
                    subtitle={
                      getInvoiceSubtitle(
                        invoice
                      )
                    }
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/invoices/${invoice._id}`
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          font-medium
                          text-indigo-400
                        "
                      >
                        View

                        <ExternalLink
                          size={13}
                        />
                      </button>
                    }
                  />

                )
              )}

            </ResultSection>

          )}


          {/* Duplicates */}
          {duplicates.length >
            0 && (

            <ResultSection
              icon={AlertTriangle}
              iconClass="text-amber-400"
              title="Duplicate Invoices"
            >

              {duplicates.map(
                (
                  duplicate,
                  index
                ) => (

                  <ResultRow
                    key={`${duplicate.filename}-${index}`}
                    title={
                      duplicate.filename ||
                      "Duplicate Invoice"
                    }
                    subtitle={
                      getDuplicateSubtitle(
                        duplicate
                      )
                    }
                    action={
                      duplicate
                        ?.existingInvoiceId ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/invoices/${duplicate.existingInvoiceId}`
                            )
                          }
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            font-medium
                            text-amber-400
                          "
                        >
                          Existing

                          <ExternalLink
                            size={13}
                          />
                        </button>
                      ) : null
                    }
                  />

                )
              )}

            </ResultSection>

          )}


          {/* Failed */}
          {failedInvoices.length >
            0 && (

            <ResultSection
              icon={CircleX}
              iconClass="text-red-400"
              title="Failed Invoices"
            >

              {failedInvoices.map(
                (
                  failed,
                  index
                ) => (

                  <ResultRow
                    key={`${failed.filename}-${index}`}
                    title={
                      failed.filename ||
                      "Invoice"
                    }
                    subtitle={
                      failed.error ||
                      "Processing failed"
                    }
                  />

                )
              )}

            </ResultSection>

          )}


          {/* Actions */}
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >

            <button
              type="button"
              onClick={
                handleReset
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-medium
                text-white
              "
            >
              <RotateCcw
                size={16}
              />

              Upload Another Batch
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/invoices"
                )
              }
              className="
                rounded-xl
                border
                border-white/[0.08]
                px-5
                py-3
                text-sm
                text-gray-300
                hover:bg-white/5
              "
            >
              View All Invoices
            </button>

          </div>

        </div>
      )}

    </div>
  );
}


function SummaryCard({
  title,
  value,
  className,
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        ${className}
      `}
    >
      <p className="text-xs">
        {title}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-bold
        "
      >
        {value}
      </p>
    </div>
  );
}


function ResultSection({
  icon: Icon,
  iconClass,
  title,
  children,
}) {
  return (
    <section
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
          gap-3
          border-b
          border-white/[0.06]
          p-5
        "
      >
        <Icon
          size={20}
          className={
            iconClass
          }
        />

        <h3
          className="
            font-semibold
            text-white
          "
        >
          {title}
        </h3>
      </div>


      <div
        className="
          divide-y
          divide-white/[0.05]
        "
      >
        {children}
      </div>

    </section>
  );
}


function ResultRow({
  title,
  subtitle,
  action,
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        px-5
        py-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >

      <div className="min-w-0">

        <p
          className="
            truncate
            text-sm
            font-medium
            text-gray-200
          "
        >
          {title}
        </p>


        <p
          className="
            mt-1
            text-xs
            text-gray-500
          "
        >
          {subtitle}
        </p>

      </div>

      {action}

    </div>
  );
}


function getInvoiceSubtitle(
  invoice
) {
  const vendor =
    invoice?.vendor?.name ||
    "Vendor not extracted";


  const confidence =
    typeof invoice?.aiMetadata
      ?.overallConfidence ===
    "number"
      ? `${Math.round(
          invoice.aiMetadata
            .overallConfidence *
            100
        )}% confidence`
      : "Confidence unavailable";


  return `${vendor} • ${confidence}`;
}


function getDuplicateSubtitle(
  duplicate
) {
  if (
    duplicate?.reason
  ) {
    return duplicate.reason;
  }


  if (
    duplicate?.invoiceNumber ||
    duplicate?.vendorName
  ) {
    return `${
      duplicate.invoiceNumber ||
      "Invoice"
    } • ${
      duplicate.vendorName ||
      "Vendor unavailable"
    }`;
  }


  return "Duplicate invoice detected";
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