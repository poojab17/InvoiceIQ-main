import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Trash2,
  Pencil,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import InvoicePreview from "../../components/invoice/InvoicePreview";
import InvoiceAnalysis from "../../components/invoice/InvoiceAnalysis";
import ConfirmModal from "../../components/ui/ConfirmModal";

import {
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} from "../../services/invoiceApi";


const EMPTY_VENDOR = {
  name: "",
  address: "",
  gstin: "",
  phone: "",
  email: "",
};

const EMPTY_CUSTOMER = {
  name: "",
  address: "",
  gstin: "",
};


export default function InvoiceDetails() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();


  const [
    invoice,
    setInvoice,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(null);


  // ==========================================
  // LOAD INVOICE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchInvoice =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getInvoiceById(
              id
            );

          if (cancelled) {
            return;
          }

          const data =
            response?.invoice ||
            null;

          if (!data) {
            throw new Error(
              "Invoice not found."
            );
          }

          setInvoice(data);

        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "Invoice details error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load invoice."
          );

        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchInvoice();

    return () => {
      cancelled = true;
    };

  }, [id]);


  // ==========================================
  // BUILD EDIT FORM
  // ==========================================

  const startEditing = () => {
    if (!invoice) {
      return;
    }

    setForm({
      vendor: {
        ...EMPTY_VENDOR,
        ...(invoice.vendor || {}),
      },

      customer: {
        ...EMPTY_CUSTOMER,
        ...(invoice.customer || {}),
      },

      invoiceNumber:
        invoice.invoiceNumber || "",

      invoiceDate:
        invoice.invoiceDate || "",

      items:
        Array.isArray(
          invoice.items
        )
          ? invoice.items.map(
              (item) => ({
                name:
                  item?.name || "",

                description:
                  item?.description || "",

                quantity:
                  numberToInput(
                    item?.quantity
                  ),

                unit:
                  item?.unit || "",

                rate:
                  numberToInput(
                    item?.rate
                  ),

                unitPrice:
                  numberToInput(
                    item?.unitPrice
                  ),

                taxRate:
                  numberToInput(
                    item?.taxRate
                  ),

                taxableValue:
                  numberToInput(
                    item?.taxableValue
                  ),

                amount:
                  numberToInput(
                    item?.amount
                  ),
              })
            )
          : [],

      subtotal:
        numberToInput(
          invoice.subtotal
        ),

      discount:
        numberToInput(
          invoice.discount
        ),

      taxRate:
        numberToInput(
          invoice.taxRate
        ),

      tax:
        numberToInput(
          invoice.tax
        ),

      totalAmount:
        numberToInput(
          invoice.totalAmount
        ),
    });

    setEditing(true);
  };


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const cancelEditing = () => {
    setEditing(false);
    setForm(null);
  };


  // ==========================================
  // NESTED FIELD CHANGE
  // ==========================================

  const updateNested = (
    section,
    field,
    value
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        [section]: {
          ...previous[section],
          [field]: value,
        },
      })
    );
  };


  // ==========================================
  // ITEM CHANGE
  // ==========================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        items:
          previous.items.map(
            (item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    [field]:
                      value,
                  }
                : item
          ),
      })
    );
  };


  // ==========================================
  // ADD ITEM
  // ==========================================

  const addItem = () => {
    setForm(
      (previous) => ({
        ...previous,

        items: [
          ...previous.items,
          {
            name: "",
            description: "",
            quantity: "",
            unit: "",
            rate: "",
            unitPrice: "",
            taxRate: "",
            taxableValue: "",
            amount: "",
          },
        ],
      })
    );
  };


  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = (
    index
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        items:
          previous.items.filter(
            (_, itemIndex) =>
              itemIndex !== index
          ),
      })
    );
  };


  // ==========================================
  // SAVE
  // ==========================================

  const handleSave =
    async () => {
      if (!form) {
        return;
      }

      try {
        setSaving(true);

        const payload = {
          vendor: {
            name:
              emptyToNull(
                form.vendor.name
              ),

            address:
              emptyToNull(
                form.vendor.address
              ),

            gstin:
              emptyToNull(
                form.vendor.gstin
              ),

            phone:
              emptyToNull(
                form.vendor.phone
              ),

            email:
              emptyToNull(
                form.vendor.email
              ),
          },

          customer: {
            name:
              emptyToNull(
                form.customer.name
              ),

            address:
              emptyToNull(
                form.customer.address
              ),

            gstin:
              emptyToNull(
                form.customer.gstin
              ),
          },

          invoiceNumber:
            emptyToNull(
              form.invoiceNumber
            ),

          invoiceDate:
            emptyToNull(
              form.invoiceDate
            ),

          items:
            form.items.map(
              (item) => ({
                name:
                  emptyToNull(
                    item.name
                  ),

                description:
                  emptyToNull(
                    item.description
                  ),

                quantity:
                  inputToNumber(
                    item.quantity
                  ),

                unit:
                  emptyToNull(
                    item.unit
                  ),

                rate:
                  inputToNumber(
                    item.rate
                  ),

                unitPrice:
                  inputToNumber(
                    item.unitPrice
                  ),

                taxRate:
                  inputToNumber(
                    item.taxRate
                  ),

                taxableValue:
                  inputToNumber(
                    item.taxableValue
                  ),

                amount:
                  inputToNumber(
                    item.amount
                  ),
              })
            ),

          subtotal:
            inputToNumber(
              form.subtotal
            ),

          discount:
            inputToNumber(
              form.discount
            ),

          taxRate:
            inputToNumber(
              form.taxRate
            ),

          tax:
            inputToNumber(
              form.tax
            ),

          totalAmount:
            inputToNumber(
              form.totalAmount
            ),
        };


        const response =
          await updateInvoice(
            id,
            payload
          );


        const updatedInvoice =
          response?.invoice;

        if (!updatedInvoice) {
          throw new Error(
            "Updated invoice was not returned."
          );
        }


        setInvoice(
          updatedInvoice
        );

        setEditing(false);
        setForm(null);


        toast.success(
          "Invoice updated successfully"
        );

      } catch (err) {
        console.error(
          "Invoice update error:",
          err
        );

        toast.error(
          err?.message ||
            "Unable to update invoice"
        );

      } finally {
        setSaving(false);
      }
    };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete =
    async () => {
      try {
        setDeleting(true);

        await deleteInvoice(id);

        toast.success(
          "Invoice deleted successfully"
        );

        navigate(
          "/invoices",
          {
            replace: true,
          }
        );

      } catch (err) {
        console.error(
          "Delete invoice error:",
          err
        );

        toast.error(
          err?.message ||
            "Unable to delete invoice"
        );

      } finally {
        setDeleting(false);
        setDeleteModalOpen(false);
      }
    };


  // ==========================================
  // STATUS
  // ==========================================

  const statusBadge =
    useMemo(
      () =>
        getStatusBadge(
          invoice?.status
        ),
      [invoice?.status]
    );


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
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
              border-t-indigo-400
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-gray-500
            "
          >
            Loading invoice...
          </p>

        </div>
      </div>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (
    error ||
    !invoice
  ) {
    return (
      <div className="space-y-6">

        <BackButton
          navigate={
            navigate
          }
        />

        <div
          className="
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/[0.05]
            p-8
          "
        >
          <AlertTriangle
            size={24}
            className="
              text-red-400
            "
          />

          <h1
            className="
              mt-4
              text-lg
              font-semibold
              text-white
            "
          >
            Invoice unavailable
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            {error ||
              "Invoice could not be loaded."}
          </p>
        </div>

      </div>
    );
  }


  return (
    <>
      <div className="space-y-8">

        {/* ==================================== */}
        {/* HEADER */}
        {/* ==================================== */}

        <section
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <BackButton
              navigate={
                navigate
              }
            />


            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              <h1
                className="
                  break-words
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                {invoice.filename}
              </h1>


              <span
                className={`
                  rounded-full
                  border
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ${statusBadge.className}
                `}
              >
                {statusBadge.label}
              </span>

            </div>


            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Review extracted information
              and correct fields when
              necessary.
            </p>

          </div>


          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >

            {!editing ? (
              <button
                type="button"
                onClick={
                  startEditing
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-indigo-500/[0.07]
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-indigo-300
                  transition
                  hover:bg-indigo-500/10
                "
              >
                <Pencil
                  size={16}
                />

                Manual Review
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    cancelEditing
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.08]
                    px-4
                    py-2.5
                    text-sm
                    text-gray-400
                    transition
                    hover:bg-white/5
                    disabled:opacity-40
                  "
                >
                  <X size={16} />

                  Cancel
                </button>


                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleSave
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-indigo-500
                    disabled:opacity-50
                  "
                >
                  <Save size={16} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </>
            )}


            {!editing && (
              <button
                type="button"
                onClick={() =>
                  setDeleteModalOpen(
                    true
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/[0.05]
                  px-4
                  py-2.5
                  text-sm
                  text-red-400
                  transition
                  hover:bg-red-500/10
                "
              >
                <Trash2
                  size={16}
                />

                Delete
              </button>
            )}

          </div>

        </section>


        {/* ==================================== */}
        {/* DOCUMENT PREVIEW */}
        {/* V1.0.0 placeholder intentionally */}
        {/* ==================================== */}

        <InvoicePreview
          invoice={invoice}
        />


        {/* ==================================== */}
        {/* READ MODE */}
        {/* ==================================== */}

        {!editing && (
          <InvoiceAnalysis
            invoice={invoice}
          />
        )}


        {/* ==================================== */}
        {/* MANUAL REVIEW MODE */}
        {/* ==================================== */}

        {editing && form && (
          <ManualReviewForm
            form={form}
            setForm={setForm}
            updateNested={
              updateNested
            }
            updateItem={
              updateItem
            }
            addItem={addItem}
            removeItem={
              removeItem
            }
          />
        )}

      </div>


      <ConfirmModal
        open={
          deleteModalOpen
        }
        title="Delete invoice?"
        description="This invoice will be permanently removed from your account. This action cannot be undone."
        confirmText="Delete Invoice"
        loading={deleting}
        onCancel={() =>
          setDeleteModalOpen(
            false
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
// MANUAL REVIEW FORM
// ==========================================

function ManualReviewForm({
  form,
  setForm,
  updateNested,
  updateItem,
  addItem,
  removeItem,
}) {
  return (
    <div className="space-y-6">

      {/* Vendor */}
      <ReviewSection
        title="Vendor Information"
        description="Correct vendor details extracted by the AI."
      >

        <Field
          label="Vendor Name"
          value={
            form.vendor.name
          }
          onChange={(value) =>
            updateNested(
              "vendor",
              "name",
              value
            )
          }
        />

        <Field
          label="Vendor Address"
          value={
            form.vendor.address
          }
          onChange={(value) =>
            updateNested(
              "vendor",
              "address",
              value
            )
          }
        />

        <Field
          label="Vendor GSTIN"
          value={
            form.vendor.gstin
          }
          onChange={(value) =>
            updateNested(
              "vendor",
              "gstin",
              value
            )
          }
        />

        <Field
          label="Vendor Phone"
          value={
            form.vendor.phone
          }
          onChange={(value) =>
            updateNested(
              "vendor",
              "phone",
              value
            )
          }
        />

        <Field
          label="Vendor Email"
          value={
            form.vendor.email
          }
          onChange={(value) =>
            updateNested(
              "vendor",
              "email",
              value
            )
          }
        />

      </ReviewSection>


      {/* Invoice */}
      <ReviewSection
        title="Invoice Information"
        description="Correct the invoice number and date."
      >

        <Field
          label="Invoice Number"
          value={
            form.invoiceNumber
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                invoiceNumber:
                  value,
              })
            )
          }
        />


        <Field
          label="Invoice Date"
          type="date"
          value={
            form.invoiceDate
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                invoiceDate:
                  value,
              })
            )
          }
        />

      </ReviewSection>


      {/* Customer */}
      <ReviewSection
        title="Customer Information"
        description="Correct customer details if extraction was incomplete."
      >

        <Field
          label="Customer Name"
          value={
            form.customer.name
          }
          onChange={(value) =>
            updateNested(
              "customer",
              "name",
              value
            )
          }
        />


        <Field
          label="Customer Address"
          value={
            form.customer.address
          }
          onChange={(value) =>
            updateNested(
              "customer",
              "address",
              value
            )
          }
        />


        <Field
          label="Customer GSTIN"
          value={
            form.customer.gstin
          }
          onChange={(value) =>
            updateNested(
              "customer",
              "gstin",
              value
            )
          }
        />

      </ReviewSection>


      {/* Financial */}
      <ReviewSection
        title="Financial Information"
        description="Values are sent to the backend as real JSON numbers."
      >

        <Field
          label="Subtotal"
          type="number"
          min="0"
          value={
            form.subtotal
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                subtotal: value,
              })
            )
          }
        />


        <Field
          label="Discount"
          type="number"
          min="0"
          value={
            form.discount
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                discount: value,
              })
            )
          }
        />


        <Field
          label="Tax Rate"
          type="number"
          min="0"
          value={
            form.taxRate
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                taxRate: value,
              })
            )
          }
        />


        <Field
          label="Tax"
          type="number"
          min="0"
          value={
            form.tax
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                tax: value,
              })
            )
          }
        />


        <Field
          label="Total Amount"
          type="number"
          min="0"
          value={
            form.totalAmount
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                totalAmount:
                  value,
              })
            )
          }
        />

      </ReviewSection>


      {/* Items */}
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
            gap-4
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
              Line Items
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Review extracted products
              and services.
            </p>
          </div>


          <button
            type="button"
            onClick={addItem}
            className="
              rounded-lg
              border
              border-indigo-500/20
              bg-indigo-500/10
              px-4
              py-2
              text-sm
              text-indigo-300
            "
          >
            Add Item
          </button>

        </div>


        {form.items.length ===
        0 ? (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-dashed
              border-white/[0.08]
              p-8
              text-center
            "
          >
            <p
              className="
                text-sm
                text-gray-500
              "
            >
              No line items. Add one
              manually if required.
            </p>
          </div>
        ) : (
          <div
            className="
              mt-6
              space-y-4
            "
          >
            {form.items.map(
              (item, index) => (
                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-[#080D18]
                    p-5
                  "
                >

                  <div
                    className="
                      mb-4
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-medium
                        text-gray-300
                      "
                    >
                      Item {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      className="
                        text-xs
                        text-red-400
                      "
                    >
                      Remove
                    </button>
                  </div>


                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-2
                      xl:grid-cols-4
                    "
                  >

                    <Field
                      label="Name"
                      value={
                        item.name
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "name",
                          value
                        )
                      }
                    />


                    <Field
                      label="Description"
                      value={
                        item.description
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "description",
                          value
                        )
                      }
                    />


                    <Field
                      label="Quantity"
                      type="number"
                      min="0"
                      value={
                        item.quantity
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "quantity",
                          value
                        )
                      }
                    />


                    <Field
                      label="Unit"
                      value={
                        item.unit
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "unit",
                          value
                        )
                      }
                    />


                    <Field
                      label="Rate"
                      type="number"
                      min="0"
                      value={
                        item.rate
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "rate",
                          value
                        )
                      }
                    />


                    <Field
                      label="Unit Price"
                      type="number"
                      min="0"
                      value={
                        item.unitPrice
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "unitPrice",
                          value
                        )
                      }
                    />


                    <Field
                      label="Tax Rate"
                      type="number"
                      min="0"
                      value={
                        item.taxRate
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "taxRate",
                          value
                        )
                      }
                    />


                    <Field
                      label="Taxable Value"
                      type="number"
                      min="0"
                      value={
                        item.taxableValue
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "taxableValue",
                          value
                        )
                      }
                    />


                    <Field
                      label="Amount"
                      type="number"
                      min="0"
                      value={
                        item.amount
                      }
                      onChange={(value) =>
                        updateItem(
                          index,
                          "amount",
                          value
                        )
                      }
                    />

                  </div>

                </div>
              )
            )}
          </div>
        )}

      </div>

    </div>
  );
}


// ==========================================
// REVIEW SECTION
// ==========================================

function ReviewSection({
  title,
  description,
  children,
}) {
  return (
    <section
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
          font-semibold
          text-white
        "
      >
        {title}
      </h2>


      <p
        className="
          mt-1
          text-xs
          text-gray-500
        "
      >
        {description}
      </p>


      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        "
      >
        {children}
      </div>

    </section>
  );
}


// ==========================================
// FIELD
// ==========================================

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
}) {
  return (
    <label
      className="
        block
        text-sm
      "
    >

      <span
        className="
          text-xs
          font-medium
          text-gray-500
        "
      >
        {label}
      </span>


      <input
        type={type}
        min={min}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/[0.08]
          bg-[#080D18]
          px-4
          py-3
          text-sm
          text-white
          outline-none
          transition
          placeholder:text-gray-700
          focus:border-indigo-500/50
        "
      />

    </label>
  );
}


// ==========================================
// BACK BUTTON
// ==========================================

function BackButton({
  navigate,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        navigate(
          "/invoices"
        )
      }
      className="
        flex
        items-center
        gap-2
        text-sm
        text-gray-500
        transition
        hover:text-white
      "
    >
      <ArrowLeft size={16} />

      Back to Invoices
    </button>
  );
}


// ==========================================
// HELPERS
// ==========================================

function numberToInput(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}


function inputToNumber(
  value
) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
}


function emptyToNull(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text =
    String(value).trim();

  return text ||
    null;
}


function getStatusBadge(
  status
) {
  switch (status) {
    case "processed":
      return {
        label:
          "Processed",

        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      };

    case "needs_review":
      return {
        label:
          "Needs Review",

        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
      };

    case "verified":
      return {
        label:
          "Verified",

        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-300",
      };

    default:
      return {
        label:
          "Unknown",

        className:
          "border-white/10 bg-white/5 text-gray-400",
      };
  }
}