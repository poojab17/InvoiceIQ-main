import {
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

import UploadZone from "../../components/upload/UploadZone";
import UploadProgress from "../../components/upload/UploadProgress";
import AIWorkflow from "../../components/upload/AIWorkflow";
import UploadSuccess from "../../components/upload/UploadSuccess";

import {
  processInvoices,
} from "../../services/invoiceApi";


export default function Upload() {
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
    processedInvoice,
    setProcessedInvoice,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // PROCESS SELECTED FILE
  // ==========================================

  const handleProcessInvoice =
    async () => {
      if (!selectedFile) {
        toast.error(
          "Please select an invoice first"
        );

        return;
      }

      try {
        setProcessing(true);
        setCompleted(false);
        setError("");
        setProgress(0);
        setCurrentStep(0);

        const response =
          await processInvoices(
            selectedFile,

            (percent) => {
              const uploadProgress =
                Math.min(
                  Math.round(
                    percent * 0.7
                  ),
                  70
                );

              setProgress(
                uploadProgress
              );
            }
          );


        // ======================================
        // VISUAL AI PIPELINE
        // ======================================

        setProgress(80);
        setCurrentStep(2);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              300
            )
        );


        setProgress(90);
        setCurrentStep(3);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              300
            )
        );


        setProgress(95);
        setCurrentStep(4);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              300
            )
        );


        const invoice =
          response?.invoices?.[0] ||
          response?.invoice ||
          null;


        if (!invoice) {
          throw new Error(
            "No saved invoice was returned. It may already exist."
          );
        }


        setProcessedInvoice(
          invoice
        );

        setProgress(100);
        setCurrentStep(5);
        setCompleted(true);


        toast.success(
          "Invoice processed successfully"
        );

      } catch (err) {
        console.error(
          "Upload page processing error:",
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
    setSelectedFile(null);
    setProgress(0);
    setCurrentStep(-1);
    setProcessing(false);
    setCompleted(false);
    setProcessedInvoice(null);
    setError("");
  };


  return (
    <div className="space-y-8">

      {/* Header */}
      <section
        className="
          rounded-3xl
          bg-gradient-to-r
          from-cyan-600
          via-blue-600
          to-indigo-700
          p-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-white/15
            "
          >
            <UploadCloud
              size={30}
              className="text-white"
            />
          </div>


          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              Upload Invoice
            </h1>


            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-blue-100
              "
            >
              Upload PDF or image invoices
              and let InvoiceIQ extract
              structured information using
              OCR and AI-powered document
              intelligence.
            </p>

          </div>

        </div>

      </section>


      {/* Upload Zone */}
      <UploadZone
        selectedFile={
          selectedFile
        }
        setSelectedFile={
          setSelectedFile
        }
      />


      {/* Process Button */}
      {selectedFile &&
        !processing &&
        !completed && (

          <button
            type="button"
            onClick={
              handleProcessInvoice
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
            Process Invoice
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

        </div>
      )}


      {/* Error */}
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

          <p
            className="
              font-semibold
              text-red-400
            "
          >
            Invoice processing failed
          </p>


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
              handleReset
            }
            className="
              mt-4
              rounded-lg
              bg-red-500/10
              px-4
              py-2
              text-sm
              text-red-400
              hover:bg-red-500/20
            "
          >
            Reset
          </button>

        </div>
      )}


      {/* Success */}
      {completed &&
        processedInvoice && (

          <div
            className="
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/[0.05]
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

              <CheckCircle2
                size={24}
                className="
                  text-emerald-400
                "
              />


              <div>

                <h2
                  className="
                    font-semibold
                    text-white
                  "
                >
                  Invoice processed
                  successfully
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-400
                  "
                >
                  {
                    processedInvoice.filename
                  }
                </p>

              </div>

            </div>


            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-3
              "
            >

              <a
                href={`/invoices/${processedInvoice._id}`}
                className="
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  hover:bg-indigo-500
                "
              >
                View Invoice
              </a>


              <button
                type="button"
                onClick={
                  handleReset
                }
                className="
                  rounded-xl
                  border
                  border-white/[0.08]
                  px-4
                  py-2.5
                  text-sm
                  text-gray-300
                  hover:bg-white/5
                "
              >
                Upload Another
              </button>

            </div>

          </div>

        )}

    </div>
  );
}