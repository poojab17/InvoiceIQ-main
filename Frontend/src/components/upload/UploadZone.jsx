import {
  useRef,
  useState,
} from "react";

import {
  CloudUpload,
  FileText,
  X,
} from "lucide-react";

import toast from "react-hot-toast";


const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const MAX_FILES = 10;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
];

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "bmp",
  "tif",
  "tiff",
];


export default function UploadZone({
  // Dashboard single mode
  selectedFile,
  setSelectedFile,

  // Upload page multiple mode
  selectedFiles,
  setSelectedFiles,

  multiple = false,
}) {
  const inputRef =
    useRef(null);

  const [
    dragging,
    setDragging,
  ] = useState(false);


  // ==========================================
  // DETERMINE MODE
  // ==========================================

  const isMultiple =
    multiple === true &&
    typeof setSelectedFiles ===
      "function";


  const files =
    isMultiple
      ? Array.isArray(
          selectedFiles
        )
        ? selectedFiles
        : []
      : selectedFile
      ? [selectedFile]
      : [];


  // ==========================================
  // VALIDATION
  // ==========================================

  const validateFile = (
    file
  ) => {
    if (!file) {
      return "Invalid file.";
    }


    const extension =
      file.name
        ?.split(".")
        ?.pop()
        ?.toLowerCase();


    const validType =
      ALLOWED_TYPES.includes(
        file.type
      );


    const validExtension =
      ALLOWED_EXTENSIONS.includes(
        extension
      );


    if (
      !validType &&
      !validExtension
    ) {
      return `${file.name}: supported formats are JPG, PNG, WEBP, BMP and TIFF.`;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return `${file.name}: maximum size is 10 MB.`;
    }


    return null;
  };


  const getFileKey = (
    file
  ) =>
    `${file.name}-${file.size}-${file.lastModified}`;


  // ==========================================
  // HANDLE FILES
  // ==========================================

  const handleFiles = (
    fileList
  ) => {
    const incoming =
      Array.from(
        fileList || []
      );


    if (
      incoming.length ===
      0
    ) {
      return;
    }


    // ========================================
    // SINGLE MODE
    // ========================================

    if (!isMultiple) {
      const file =
        incoming[0];


      const error =
        validateFile(file);


      if (error) {
        toast.error(error);

        return;
      }


      if (
        typeof setSelectedFile !==
        "function"
      ) {
        console.error(
          "UploadZone: setSelectedFile prop is missing"
        );

        toast.error(
          "Upload component is not configured correctly."
        );

        return;
      }


      setSelectedFile(file);


      toast.success(
        "Invoice selected"
      );


      return;
    }


    // ========================================
    // MULTIPLE MODE
    // ========================================

    const current =
      Array.isArray(
        selectedFiles
      )
        ? selectedFiles
        : [];


    if (
      current.length >=
      MAX_FILES
    ) {
      toast.error(
        "Maximum 10 invoices can be selected."
      );

      return;
    }


    const existingKeys =
      new Set(
        current.map(
          getFileKey
        )
      );


    const accepted = [];


    for (
      const file of incoming
    ) {
      const error =
        validateFile(file);


      if (error) {
        toast.error(error);

        continue;
      }


      const key =
        getFileKey(file);


      if (
        existingKeys.has(key)
      ) {
        toast(
          `${file.name} is already selected`,
          {
            icon: "⚠️",
          }
        );

        continue;
      }


      existingKeys.add(key);

      accepted.push(file);
    }


    if (
      accepted.length ===
      0
    ) {
      return;
    }


    const availableSlots =
      MAX_FILES -
      current.length;


    const filesToAdd =
      accepted.slice(
        0,
        availableSlots
      );


    if (
      accepted.length >
      availableSlots
    ) {
      toast.error(
        `Maximum 10 files allowed. Only ${availableSlots} additional file(s) were accepted.`
      );
    }


    setSelectedFiles([
      ...current,
      ...filesToAdd,
    ]);


    toast.success(
      `${filesToAdd.length} invoice${
        filesToAdd.length === 1
          ? ""
          : "s"
      } selected`
    );
  };


  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleInputChange = (
    event
  ) => {
    handleFiles(
      event.target.files
    );


    event.target.value =
      "";
  };


  // ==========================================
  // FILE PICKER
  // ==========================================

  const openFilePicker = (
    event
  ) => {
    event?.stopPropagation();

    inputRef.current?.click();
  };


  // ==========================================
  // DRAG
  // ==========================================

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();

    setDragging(true);
  };


  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();

    setDragging(false);
  };


  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    setDragging(false);


    handleFiles(
      event.dataTransfer.files
    );
  };


  // ==========================================
  // REMOVE FILE
  // ==========================================

  const removeFile = (
    fileToRemove,
    event
  ) => {
    event?.stopPropagation();


    if (isMultiple) {
      setSelectedFiles(
        files.filter(
          (file) =>
            getFileKey(file) !==
            getFileKey(
              fileToRemove
            )
        )
      );

      return;
    }


    setSelectedFile?.(
      null
    );
  };


  // ==========================================
  // SIZE
  // ==========================================

  const formatSize = (
    size
  ) =>
    `${(
      size /
      1024 /
      1024
    ).toFixed(2)} MB`;


  return (
    <div className="space-y-4">

      {/* ====================================== */}
      {/* NATIVE INPUT */}
      {/* ====================================== */}

      <input
        ref={inputRef}
        type="file"
        multiple={
          isMultiple
        }
        accept="
          image/jpeg,
          image/png,
          image/webp,
          image/bmp,
          image/tiff,
          .jpg,
          .jpeg,
          .png,
          .webp,
          .bmp,
          .tif,
          .tiff
        "
        onChange={
          handleInputChange
        }
        className="hidden"
      />


      {/* ====================================== */}
      {/* EMPTY */}
      {/* ====================================== */}

      {files.length === 0 ? (

        <div
          role="button"
          tabIndex={0}
          onClick={
            openFilePicker
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" ||
              event.key === " "
            ) {
              openFilePicker(
                event
              );
            }
          }}
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={
            handleDrop
          }
          className={`
            group
            flex
            min-h-[320px]
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            p-8
            text-center
            outline-none
            transition-all

            ${
              dragging
                ? `
                  border-indigo-400
                  bg-indigo-500/[0.08]
                `
                : `
                  border-gray-700
                  bg-[#111827]
                  hover:border-indigo-500/50
                `
            }
          `}
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-blue-500/10
            "
          >

            <CloudUpload
              size={34}
              className="
                text-blue-400
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
            Drag & Drop Invoice
            {isMultiple
              ? "s"
              : ""}
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-gray-400
            "
          >
            JPG, PNG, WEBP,
            BMP or TIFF
          </p>


          <p
            className="
              mt-1
              text-xs
              text-gray-600
            "
          >
            Maximum 10 MB per file
            {isMultiple
              ? " • Up to 10 files"
              : ""}
          </p>


          <button
            type="button"
            onClick={
              openFilePicker
            }
            className="
              mt-6
              rounded-xl
              bg-blue-600
              px-6
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-500
            "
          >
            Browse Files
          </button>

        </div>

      ) : (

        /* ==================================== */
        /* SELECTED QUEUE */
        /* ==================================== */

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
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-emerald-400
                "
              >
                {isMultiple
                  ? "Invoice Queue"
                  : "Invoice Selected"}
              </p>


              <h3
                className="
                  mt-1
                  font-semibold
                  text-white
                "
              >
                {files.length}{" "}
                file
                {files.length ===
                1
                  ? ""
                  : "s"}{" "}
                selected
              </h3>

            </div>


            {isMultiple &&
              files.length <
                MAX_FILES && (

                <button
                  type="button"
                  onClick={
                    openFilePicker
                  }
                  className="
                    rounded-lg
                    border
                    border-indigo-500/20
                    bg-indigo-500/10
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-indigo-300
                    transition
                    hover:bg-indigo-500/20
                  "
                >
                  Add More
                </button>

              )}

          </div>


          <div
            className="
              mt-5
              space-y-3
            "
          >

            {files.map(
              (file) => (

                <div
                  key={
                    getFileKey(file)
                  }
                  className="
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

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-500/10
                    "
                  >

                    <FileText
                      size={21}
                      className="
                        text-emerald-400
                      "
                    />

                  </div>


                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-white
                      "
                    >
                      {file.name}
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-500
                      "
                    >
                      {formatSize(
                        file.size
                      )}
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={(
                      event
                    ) =>
                      removeFile(
                        file,
                        event
                      )
                    }
                    aria-label={`Remove ${file.name}`}
                    className="
                      rounded-lg
                      p-2
                      text-gray-500
                      transition
                      hover:bg-red-500/10
                      hover:text-red-400
                    "
                  >
                    <X size={17} />
                  </button>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}