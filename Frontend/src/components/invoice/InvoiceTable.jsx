import {
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from "lucide-react";

import {
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  deleteInvoice,
} from "../../services/invoiceApi";

import ConfirmModal from "../ui/ConfirmModal";


export default function InvoiceTable({
  invoices = [],

  search = "",
  status = "",
  sort = "newest",

  onSearchChange,
  onStatusChange,
  onSortChange,

  pagination,

  loading = false,

  onPageChange,
  onViewInvoice,
  onInvoiceDeleted,

  compact = false,
}) {
  const [
    pendingDeleteId,
    setPendingDeleteId,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);


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


  const displayValue = (value) => {
    return hasValue(value)
      ? value
      : "Not extracted";
  };


  const formatAmount = (value) => {
    if (!hasValue(value)) {
      return "Not extracted";
    }

    const number =
      Number(value);

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


  const formatCreatedDate = (
    value
  ) => {
    if (!value) {
      return "Not available";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not available";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (
    value
  ) => {
    switch (value) {
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


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete =
    async () => {
      if (!pendingDeleteId) {
        return;
      }

      try {
        setDeleting(true);


        await deleteInvoice(
          pendingDeleteId
        );


        toast.success(
          "Invoice deleted successfully"
        );


        onInvoiceDeleted?.(
          pendingDeleteId
        );


        setPendingDeleteId(
          null
        );

      } catch (error) {
        console.error(
          "Delete invoice error:",
          error
        );


        toast.error(
          error?.message ||
            "Failed to delete invoice"
        );

      } finally {
        setDeleting(false);
      }
    };


  const currentPage =
    pagination?.currentPage ??
    1;

  const totalPages =
    pagination?.totalPages ??
    1;

  const totalInvoices =
    pagination?.totalInvoices ??
    invoices.length;


  return (
    <>
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#111827]
        "
      >

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div
          className="
            border-b
            border-white/[0.07]
            p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                {compact
                  ? "Recent Invoices"
                  : "Invoices"}
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                {loading
                  ? "Loading..."
                  : compact
                  ? `${invoices.length} recent invoice(s)`
                  : `${totalInvoices} invoice(s) found`}
              </p>

            </div>


            {/* Full workspace controls */}
            {!compact && (
              <div
                className="
                  flex
                  w-full
                  flex-col
                  gap-3
                  md:flex-row
                  xl:w-auto
                "
              >

                {/* Search */}
                <div
                  className="
                    relative
                    w-full
                    xl:w-80
                  "
                >

                  <Search
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-600
                    "
                  />


                  <input
                    type="search"
                    value={search}
                    onChange={(
                      event
                    ) =>
                      onSearchChange?.(
                        event.target.value
                      )
                    }
                    placeholder="Search invoices..."
                    aria-label="Search invoices"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-[#080D18]
                      py-3
                      pl-10
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      transition
                      placeholder:text-gray-600
                      focus:border-indigo-500/40
                    "
                  />

                </div>


                {/* Status */}
                <div className="relative">

                  <Filter
                    size={16}
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-600
                    "
                  />


                  <select
                    value={status}
                    onChange={(
                      event
                    ) =>
                      onStatusChange?.(
                        event.target.value
                      )
                    }
                    aria-label="Filter by invoice status"
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-[#080D18]
                      py-3
                      pl-10
                      pr-8
                      text-sm
                      text-gray-300
                      outline-none
                      md:w-44
                    "
                  >

                    <option value="">
                      All Statuses
                    </option>

                    <option value="processed">
                      Processed
                    </option>

                    <option value="needs_review">
                      Needs Review
                    </option>

                  </select>

                </div>


                {/* Sort */}
                <div className="relative">

                  <ArrowUpDown
                    size={16}
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-600
                    "
                  />


                  <select
                    value={sort}
                    onChange={(
                      event
                    ) =>
                      onSortChange?.(
                        event.target.value
                      )
                    }
                    aria-label="Sort invoices"
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-[#080D18]
                      py-3
                      pl-10
                      pr-8
                      text-sm
                      text-gray-300
                      outline-none
                      md:w-48
                    "
                  >

                    <option value="newest">
                      Newest first
                    </option>

                    <option value="oldest">
                      Oldest first
                    </option>

                    <option value="highest_amount">
                      Highest amount
                    </option>

                    <option value="lowest_amount">
                      Lowest amount
                    </option>

                  </select>

                </div>

              </div>
            )}

          </div>

        </div>


        {/* ================================== */}
        {/* LOADING */}
        {/* ================================== */}

        {loading ? (

          <TableLoading />

        ) : invoices.length === 0 ? (

          <div
            className="
              px-6
              py-14
              text-center
            "
          >

            <Search
              size={32}
              className="
                mx-auto
                text-gray-700
              "
            />


            <h3
              className="
                mt-4
                font-medium
                text-white
              "
            >
              No invoices found
            </h3>


            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              {compact
                ? "Upload an invoice to see it here."
                : "Try changing your search or filter options."}
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
                    Filename
                  </th>

                  <th className="px-5 py-4">
                    Vendor
                  </th>

                  <th className="px-5 py-4">
                    Invoice #
                  </th>

                  {!compact && (
                    <th className="px-5 py-4">
                      Customer
                    </th>
                  )}

                  <th className="px-5 py-4">
                    Invoice Date
                  </th>

                  <th className="px-5 py-4">
                    Total
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  {!compact && (
                    <th className="px-5 py-4">
                      Created
                    </th>
                  )}

                  <th className="px-5 py-4">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {invoices.map(
                  (invoice) => {
                    const badge =
                      getStatusBadge(
                        invoice?.status
                      );


                    return (
                      <tr
                        key={
                          invoice._id
                        }
                        className="
                          border-b
                          border-white/[0.05]
                          text-sm
                          transition
                          hover:bg-white/[0.018]
                        "
                      >

                        {/* Filename */}
                        <td
                          className="
                            max-w-[190px]
                            truncate
                            px-5
                            py-4
                            font-medium
                            text-gray-200
                          "
                          title={
                            invoice?.filename
                          }
                        >
                          {displayValue(
                            invoice?.filename
                          )}
                        </td>


                        {/* Vendor */}
                        <td
                          className="
                            max-w-[200px]
                            truncate
                            px-5
                            py-4
                            text-gray-300
                          "
                          title={
                            invoice
                              ?.vendor
                              ?.name
                          }
                        >
                          {displayValue(
                            invoice
                              ?.vendor
                              ?.name
                          )}
                        </td>


                        {/* Invoice Number */}
                        <td
                          className="
                            whitespace-nowrap
                            px-5
                            py-4
                            text-gray-400
                          "
                        >
                          {displayValue(
                            invoice
                              ?.invoiceNumber
                          )}
                        </td>


                        {/* Customer */}
                        {!compact && (
                          <td
                            className="
                              max-w-[180px]
                              truncate
                              px-5
                              py-4
                              text-gray-400
                            "
                          >
                            {displayValue(
                              invoice
                                ?.customer
                                ?.name
                            )}
                          </td>
                        )}


                        {/* Invoice Date */}
                        <td
                          className="
                            whitespace-nowrap
                            px-5
                            py-4
                            text-gray-500
                          "
                        >
                          {displayValue(
                            invoice
                              ?.invoiceDate
                          )}
                        </td>


                        {/* Amount */}
                        <td
                          className="
                            whitespace-nowrap
                            px-5
                            py-4
                            font-medium
                            text-white
                          "
                        >
                          {formatAmount(
                            invoice
                              ?.totalAmount
                          )}
                        </td>


                        {/* Status */}
                        <td
                          className="
                            whitespace-nowrap
                            px-5
                            py-4
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-xs
                              font-medium
                              ${badge.className}
                            `}
                          >
                            {badge.label}
                          </span>

                        </td>


                        {/* Created */}
                        {!compact && (
                          <td
                            className="
                              whitespace-nowrap
                              px-5
                              py-4
                              text-gray-500
                            "
                          >
                            {formatCreatedDate(
                              invoice
                                ?.createdAt
                            )}
                          </td>
                        )}


                        {/* Actions */}
                        <td className="px-5 py-4">

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                onViewInvoice?.(
                                  invoice._id
                                )
                              }
                              aria-label="View invoice"
                              title="View Invoice"
                              className="
                                rounded-lg
                                p-2
                                text-blue-400
                                transition
                                hover:bg-blue-500/10
                              "
                            >
                              <Eye
                                size={17}
                              />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                setPendingDeleteId(
                                  invoice._id
                                )
                              }
                              aria-label="Delete invoice"
                              title="Delete Invoice"
                              className="
                                rounded-lg
                                p-2
                                text-red-400
                                transition
                                hover:bg-red-500/10
                              "
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* ================================== */}
        {/* SERVER PAGINATION */}
        {/* ================================== */}

        {!compact &&
          !loading &&
          invoices.length > 0 && (

          <div
            className="
              flex
              flex-col
              gap-4
              border-t
              border-white/[0.06]
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              Page{" "}
              <span className="text-gray-300">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="text-gray-300">
                {totalPages}
              </span>
            </p>


            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <button
                type="button"
                disabled={
                  !pagination
                    ?.hasPreviousPage
                }
                onClick={() =>
                  onPageChange?.(
                    currentPage - 1
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-white/[0.08]
                  px-4
                  py-2
                  text-sm
                  text-gray-400
                  transition
                  hover:bg-white/5
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <ChevronLeft
                  size={16}
                />

                Previous
              </button>


              <button
                type="button"
                disabled={
                  !pagination
                    ?.hasNextPage
                }
                onClick={() =>
                  onPageChange?.(
                    currentPage + 1
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-white/[0.08]
                  px-4
                  py-2
                  text-sm
                  text-gray-400
                  transition
                  hover:bg-white/5
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                Next

                <ChevronRight
                  size={16}
                />
              </button>

            </div>

          </div>

        )}

      </div>


      {/* Delete Modal */}
      <ConfirmModal
        open={
          Boolean(
            pendingDeleteId
          )
        }
        title="Delete invoice?"
        description="This invoice will be permanently removed from your account. This action cannot be undone."
        confirmText="Delete Invoice"
        loading={deleting}
        onCancel={() =>
          setPendingDeleteId(
            null
          )
        }
        onConfirm={
          handleDelete
        }
      />

    </>
  );
}


// ==========================================
// TABLE LOADING
// ==========================================

function TableLoading() {
  return (
    <div className="p-5">

      {[1, 2, 3, 4].map(
        (row) => (

          <div
            key={row}
            className="
              mb-3
              grid
              grid-cols-5
              gap-4
            "
          >

            {[1, 2, 3, 4, 5].map(
              (cell) => (

                <div
                  key={cell}
                  className="
                    h-10
                    animate-pulse
                    rounded-lg
                    bg-white/[0.04]
                  "
                />

              )
            )}

          </div>

        )
      )}

    </div>
  );
}