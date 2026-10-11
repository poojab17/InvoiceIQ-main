import api from "./api";


// ==========================================
// PROCESS INVOICES
// ==========================================

export async function processInvoices(
  files,
  onUploadProgress
) {
  try {
    const formData =
      new FormData();

    const fileList =
      Array.isArray(files)
        ? files
        : [files];

    fileList.forEach(
      (file) => {
        if (file) {
          formData.append(
            "invoices",
            file
          );
        }
      }
    );


    const response =
      await api.post(
        "/invoices/process",
        formData,
        {
          onUploadProgress:
            (event) => {
              if (
                !event.total
              ) {
                return;
              }

              const percent =
                Math.round(
                  (
                    event.loaded *
                    100
                  ) /
                    event.total
                );

              onUploadProgress?.(
                percent
              );
            },
        }
      );


    return response.data;

  } catch (error) {
    console.error(
      "Process invoices error:",
      error
    );

    const backendMessage =
      error.response?.data
        ?.message;

    const backendError =
      error.response?.data
        ?.error;


    throw new Error(
      backendMessage ||
        backendError ||
        "Failed to process invoices"
    );
  }
}


// ==========================================
// GET INVOICE STATS
// ==========================================

export async function getInvoiceStats() {
  try {
    const response =
      await api.get(
        "/invoices/stats"
      );

    return response.data;

  } catch (error) {
    console.error(
      "Invoice stats error:",
      error
    );

    throw new Error(
      error.response?.data
        ?.message ||
        "Failed to fetch invoice statistics"
    );
  }
}


// ==========================================
// GET INVOICES
// ==========================================

export async function getInvoices({
  search = "",
  status = "",
  sort = "newest",
  page = 1,
  limit = 10,
} = {}) {
  try {
    const params = {
      page,
      limit,
      sort,
    };


    if (search.trim()) {
      params.search =
        search.trim();
    }


    if (status) {
      params.status =
        status;
    }


    const response =
      await api.get(
        "/invoices",
        {
          params,
        }
      );


    return response.data;

  } catch (error) {
    console.error(
      "Get invoices error:",
      error
    );

    throw new Error(
      error.response?.data
        ?.message ||
        "Failed to fetch invoices"
    );
  }
}


// ==========================================
// GET SINGLE INVOICE
// ==========================================

export async function getInvoiceById(
  id
) {
  try {
    const response =
      await api.get(
        `/invoices/${id}`
      );

    return response.data;

  } catch (error) {
    console.error(
      "Get invoice error:",
      error
    );

    throw new Error(
      error.response?.data
        ?.message ||
        "Failed to fetch invoice"
    );
  }
}


// ==========================================
// UPDATE INVOICE
// ==========================================

export async function updateInvoice(
  id,
  payload
) {
  try {
    const response =
      await api.patch(
        `/invoices/${id}`,
        payload
      );

    return response.data;

  } catch (error) {
    console.error(
      "Update invoice error:",
      error
    );

    const message =
      error.response?.data
        ?.message;


    throw new Error(
      message ||
        "Failed to update invoice"
    );
  }
}


// ==========================================
// DELETE INVOICE
// ==========================================

export async function deleteInvoice(
  id
) {
  try {
    const response =
      await api.delete(
        `/invoices/${id}`
      );

    return response.data;

  } catch (error) {
    console.error(
      "Delete invoice error:",
      error
    );

    throw new Error(
      error.response?.data
        ?.message ||
        "Failed to delete invoice"
    );
  }
}