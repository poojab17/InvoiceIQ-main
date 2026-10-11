import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FileText,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import InvoiceTable from "../../components/invoice/InvoiceTable";

import {
  getInvoices,
} from "../../services/invoiceApi";


export default function Invoices() {
  const navigate = useNavigate();


  // ==========================================
  // DATA
  // ==========================================

  const [invoices, setInvoices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // FILTERS
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [sort, setSort] =
    useState("newest");

  const [page, setPage] =
    useState(1);

  const limit = 10;


  // ==========================================
  // PAGINATION
  // ==========================================

  const [
    pagination,
    setPagination,
  ] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
    totalInvoices: 0,
  });


  // ==========================================
  // FETCH INVOICES
  // ==========================================

  const fetchInvoices =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");


        const response =
          await getInvoices({
            search:
              search.trim() ||
              undefined,

            status:
              status ||
              undefined,

            sort,

            page,

            limit,
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


        const backendPagination =
          response?.pagination ||
          {};


        setPagination({
          currentPage:
            backendPagination.currentPage ??
            page,

          totalPages:
            backendPagination.totalPages ??
            1,

          limit:
            backendPagination.limit ??
            limit,

          hasNextPage:
            backendPagination.hasNextPage ??
            false,

          hasPreviousPage:
            backendPagination.hasPreviousPage ??
            false,

          totalInvoices:
            response?.totalInvoices ??
            0,
        });

      } catch (err) {
        console.error(
          "Fetch invoices error:",
          err
        );


        const message =
          err?.message ||
          "Unable to load invoices.";


        setError(message);

      } finally {
        setLoading(false);
      }
    }, [
      search,
      status,
      sort,
      page,
    ]);


  // ==========================================
  // FETCH
  // ==========================================

  useEffect(() => {
    /*
      Small delay prevents sending a request
      for every single search keystroke.
    */

    const timer =
      setTimeout(() => {
        fetchInvoices();
      }, search ? 350 : 0);


    return () => {
      clearTimeout(timer);
    };

  }, [
    fetchInvoices,
    search,
  ]);


  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearchChange = (
    value
  ) => {
    setSearch(value);

    setPage(1);
  };


  // ==========================================
  // STATUS
  // ==========================================

  const handleStatusChange = (
    value
  ) => {
    setStatus(value);

    setPage(1);
  };


  // ==========================================
  // SORT
  // ==========================================

  const handleSortChange = (
    value
  ) => {
    setSort(value);

    setPage(1);
  };


  // ==========================================
  // PAGE
  // ==========================================

  const handlePageChange = (
    nextPage
  ) => {
    if (
      nextPage < 1 ||
      nextPage >
        pagination.totalPages
    ) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
  // DELETE CALLBACK
  // ==========================================

  const handleInvoiceDeleted =
    async () => {
      /*
        InvoiceTable already calls DELETE.

        We only refresh server data here.
      */

      try {
        await fetchInvoices();

      } catch (err) {
        console.error(
          "Refresh after delete:",
          err
        );

        toast.error(
          "Invoice deleted, but the list could not be refreshed."
        );
      }
    };


  return (
    <div className="space-y-8">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-2
              text-indigo-400
            "
          >
            <FileText size={16} />

            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
              "
            >
              Documents
            </span>
          </div>


          <h1
            className="
              mt-3
              text-3xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Invoices
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
            Search, review and manage
            invoices processed by
            InvoiceIQ.
          </p>

        </div>


        {/* Refresh */}
        <button
          type="button"
          disabled={loading}
          onClick={
            fetchInvoices
          }
          className="
            flex
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
            font-medium
            text-gray-300
            transition
            hover:bg-white/[0.04]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </section>


      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

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
              font-medium
              text-red-400
            "
          >
            Unable to load invoices
          </p>


          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            {error}
          </p>


          <button
            type="button"
            onClick={
              fetchInvoices
            }
            className="
              mt-4
              rounded-lg
              bg-red-500/10
              px-4
              py-2
              text-sm
              text-red-300
              transition
              hover:bg-red-500/20
            "
          >
            Try Again
          </button>

        </div>
      )}


      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <InvoiceTable
        invoices={invoices}

        loading={loading}

        search={search}
        status={status}
        sort={sort}

        pagination={
          pagination
        }

        onSearchChange={
          handleSearchChange
        }

        onStatusChange={
          handleStatusChange
        }

        onSortChange={
          handleSortChange
        }

        onPageChange={
          handlePageChange
        }

        onViewInvoice={
          handleViewInvoice
        }

        onInvoiceDeleted={
          handleInvoiceDeleted
        }
      />

    </div>
  );
}