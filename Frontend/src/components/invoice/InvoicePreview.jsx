import {
  FileImage,
  Maximize2,
  ZoomIn,
  ScanLine,
} from "lucide-react";


export default function InvoicePreview({
  invoice,
}) {
  /*
    Backend currently does not expose
    a persistent document URL.

    Future support can plug into:

    invoice.previewUrl
    invoice.fileUrl
    invoice.documentUrl
  */

  const previewUrl =
    invoice?.previewUrl ||
    invoice?.fileUrl ||
    invoice?.documentUrl ||
    null;


  const isPdf =
    previewUrl
      ?.toLowerCase()
      ?.includes(".pdf");


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

      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-white/[0.07]
          px-5
          py-4
        "
      >

        <div>

          <h2
            className="
              font-semibold
              text-white
            "
          >
            Document Preview
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-gray-500
            "
          >
            Original invoice document
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-1
          "
        >

          <button
            type="button"
            disabled={!previewUrl}
            aria-label="Zoom document"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition
              hover:bg-white/5
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <ZoomIn size={17} />
          </button>


          <button
            type="button"
            disabled={!previewUrl}
            aria-label="Open fullscreen"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition
              hover:bg-white/5
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <Maximize2 size={17} />
          </button>

        </div>

      </div>


      {/* Preview */}
      <div
        className="
          flex
          min-h-[520px]
          items-center
          justify-center
          bg-[#080D18]
          p-6
        "
      >

        {previewUrl ? (

          isPdf ? (

            <iframe
              src={previewUrl}
              title="Invoice preview"
              className="
                h-[600px]
                w-full
                rounded-xl
                border-0
                bg-white
              "
            />

          ) : (

            <img
              src={previewUrl}
              alt={
                invoice?.filename ||
                "Invoice preview"
              }
              className="
                max-h-[640px]
                max-w-full
                rounded-xl
                object-contain
              "
            />

          )

        ) : (

          <div
            className="
              max-w-sm
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

              <FileImage
                size={30}
                className="
                  text-indigo-400
                "
              />

            </div>


            <h3
              className="
                mt-5
                font-semibold
                text-white
              "
            >
              Preview unavailable
            </h3>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500
              "
            >
              The backend currently stores
              invoice metadata but does not
              expose a persistent document URL.
            </p>


            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/[0.08]
                bg-white/[0.03]
                px-3
                py-1.5
                text-xs
                text-gray-500
              "
            >

              <ScanLine size={14} />

              Preview support ready

            </div>

          </div>

        )}

      </div>

    </div>
  );
}