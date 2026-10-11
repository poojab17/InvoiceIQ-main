const express = require("express");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const axios = require("axios");
const FormData = require("form-data");

const Invoice = require("../models/Invoice");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==================================================
// VALIDATION HELPERS
// ==================================================

const allowedStatuses = [
    "processed",
    "needs_review"
];

const allowedSortOptions = [
    "newest",
    "oldest",
    "highest_amount",
    "lowest_amount"
];


const validateInvoiceQuery = (req, res, next) => {

    const {
        page,
        limit,
        status,
        sort
    } = req.query;


    if (
        page !== undefined &&
        (
            !Number.isInteger(Number(page)) ||
            Number(page) < 1
        )
    ) {

        return res.status(400).json({

            message:
                "Page must be a positive integer"

        });

    }


    if (
        limit !== undefined &&
        (
            !Number.isInteger(Number(limit)) ||
            Number(limit) < 1 ||
            Number(limit) > 50
        )
    ) {

        return res.status(400).json({

            message:
                "Limit must be an integer between 1 and 50"

        });

    }


    if (
        status &&
        !allowedStatuses.includes(status)
    ) {

        return res.status(400).json({

            message:
                "Invalid invoice status",

            allowedStatuses

        });

    }


    if (
        sort &&
        !allowedSortOptions.includes(sort)
    ) {

        return res.status(400).json({

            message:
                "Invalid sort option",

            allowedSortOptions

        });

    }


    next();

};

const validateInvoiceId = (req, res, next) => {

    const { id } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(id)
    ) {

        return res.status(400).json({

            message:
                "Invalid invoice ID"

        });

    }

    next();

};
// ==================================================
// FILE HASH HELPER
// ==================================================

const calculateFileHash = (filePath) => {

    const fileBuffer = fs.readFileSync(
        filePath
    );

    return crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

};

// ==================================================
// PROTECT ALL INVOICE ROUTES
// ==================================================

router.use(protect);


// ==================================================
// UNWRAP AI FIELD VALUE
// ==================================================

const unwrapValue = (value) => {

    if (
        value &&
        typeof value === "object" &&
        "value" in value
    ) {

        return value.value;

    }

    return value;

};


// ==================================================
// NUMBER CLEANING HELPER
// ==================================================

const cleanNumber = (value) => {

    value = unwrapValue(value);

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }

    const cleanedValue = String(value)
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "");

    const number = Number(cleanedValue);

    return Number.isNaN(number)
        ? null
        : number;

};


// ==================================================
// CONFIDENCE CLEANING HELPER
// ==================================================

const cleanConfidence = (value) => {

    const number = cleanNumber(value);

    if (number === null) {

        return 0;

    }

    return Math.max(
        0,
        Math.min(number, 1)
    );

};


// ==================================================
// ITEM NORMALIZATION
// ==================================================

const normalizeItems = (items) => {

    if (!Array.isArray(items)) {

        return [];

    }

    return items.map((item) => {

        const itemName = unwrapValue(
            item.name
        );

        const itemDescription = unwrapValue(
            item.description
        );

        const quantity = cleanNumber(
            item.quantity
        );

        const rate = cleanNumber(
            item.rate
        );

        const unitPrice = cleanNumber(
            item.unit_price ??
            item.unitPrice ??
            item.rate
        );

        const taxableValue = cleanNumber(
            item.taxable_value ??
            item.taxableValue
        );

        const amount = cleanNumber(
            item.amount ??
            item.taxable_value ??
            item.taxableValue
        );

        return {

            name:
                itemName ||
                itemDescription ||
                null,

            description:
                itemDescription ||
                itemName ||
                null,

            quantity,

            unit:
                unwrapValue(
                    item.unit
                ) || null,

            rate,

            unitPrice,

            taxRate:
                cleanNumber(
                    item.tax_rate ??
                    item.taxRate
                ),

            taxableValue,

            amount

        };

    });

};


// ==================================================
// AI METADATA NORMALIZATION
// ==================================================

const normalizeAiMetadata = (aiMetadata = {}) => {

    const fieldConfidence =
        aiMetadata.field_confidence ||
        aiMetadata.fieldConfidence ||
        {};

    return {

        overallConfidence:
            cleanConfidence(
                aiMetadata.overall_confidence ??
                aiMetadata.overallConfidence
            ),

        fieldConfidence: {

            vendorName:
                cleanConfidence(
                    fieldConfidence.vendor_name ??
                    fieldConfidence.vendorName
                ),

            invoiceNumber:
                cleanConfidence(
                    fieldConfidence.invoice_number ??
                    fieldConfidence.invoiceNumber
                ),

            invoiceDate:
                cleanConfidence(
                    fieldConfidence.invoice_date ??
                    fieldConfidence.invoiceDate
                ),

            customerName:
                cleanConfidence(
                    fieldConfidence.customer_name ??
                    fieldConfidence.customerName
                ),

            customerAddress:
                cleanConfidence(
                    fieldConfidence.customer_address ??
                    fieldConfidence.customerAddress
                ),

            customerGstin:
                cleanConfidence(
                    fieldConfidence.customer_gstin ??
                    fieldConfidence.customerGstin
                ),

            items:
                cleanConfidence(
                    fieldConfidence.items
                ),

            subtotal:
                cleanConfidence(
                    fieldConfidence.subtotal
                ),

            discount:
                cleanConfidence(
                    fieldConfidence.discount
                ),

            taxRate:
                cleanConfidence(
                    fieldConfidence.tax_rate ??
                    fieldConfidence.taxRate
                ),

            tax:
                cleanConfidence(
                    fieldConfidence.tax
                ),

            total:
                cleanConfidence(
                    fieldConfidence.total
                )

        },

        modelVersion:
            aiMetadata.model_version ||
            aiMetadata.modelVersion ||
            null,

        processingTimeMs:
            cleanNumber(
                aiMetadata.processing_time_ms ??
                aiMetadata.processingTimeMs
            ) || 0

    };

};


// ==================================================
// REVIEW STATUS HELPER
// ==================================================
const determineInvoiceStatus = (
    structuredData,
    aiMetadata
) => {

    const overallConfidence =
        aiMetadata.overallConfidence || 0;

    const missingCriticalFields =
        !structuredData.vendor_name ||
        !structuredData.invoice_date ||
        structuredData.total == null;

    if (
        overallConfidence < 0.75 ||
        missingCriticalFields
    ) {
        return "needs_review";
    }

    return "processed";

};


// ==================================================
// MULTER CONFIGURATION
// ==================================================

const upload = multer({

    dest: "uploads/",

    limits: {

        fileSize:
            10 * 1024 * 1024,

        files:
            10

    },

    fileFilter: (
        req,
        file,
        callback
    ) => {

        const allowedTypes = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/bmp",
            "image/tiff"

        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            return callback(
                null,
                true
            );

        }

        return callback(

            new Error(
                "Only invoice image files are allowed"
            )

        );

    }

});


// ==================================================
// POST /api/invoices/process
// PROCESS AND SAVE INVOICES
// ==================================================

router.post(

    "/process",

    upload.array(
        "invoices",
        10
    ),

    async (req, res) => {

        try {

            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "No invoice files uploaded"

                });

            }

            const invoices = [];

            const skippedDuplicates = [];

            const failedInvoices = [];


            for (const file of req.files) {

                try {

                    console.log(
                        "\n===================================="
                    );

                    console.log(
                        "PROCESSING INVOICE:",
                        file.originalname
                    );

// --------------------------------------
// FILE HASH DUPLICATE CHECK
// --------------------------------------

const fileHash =
    calculateFileHash(
        file.path
    );

const existingHashInvoice =
    await Invoice.findOne({

        user:
            req.user.userId,

        fileHash

    });

if (existingHashInvoice) {

    console.log(
        "DUPLICATE FILE HASH FOUND"
    );

    skippedDuplicates.push({

        filename:
            file.originalname,

        reason:
            "Same invoice file already uploaded",

        existingInvoiceId:
            existingHashInvoice._id

    });

    continue;

}
                    // --------------------------------------
                    // CREATE FORMDATA
                    // --------------------------------------

                    const formData =
                        new FormData();

                    formData.append(

                        "file",

                        fs.createReadStream(
                            file.path
                        ),

                        {

                            filename:
                                file.originalname,

                            contentType:
                                file.mimetype

                        }

                    );


                    // --------------------------------------
                    // SEND TO AI SERVICE
                    // --------------------------------------

                    const response =
                        await axios.post(

                            "http://127.0.0.1:8000/process-invoice",

                            formData,

                            {

                                headers: {

                                    ...formData.getHeaders()

                                },

                                timeout:
                                    120000,

                                maxContentLength:
                                    Infinity,

                                maxBodyLength:
                                    Infinity

                            }

                        );


                    // --------------------------------------
                    // PYTHON RESPONSE
                    // --------------------------------------

                    const pythonResponse =
                        response.data;

                    const invoice =
                        pythonResponse.invoice;

                    if (
                        !invoice ||
                        !invoice.structured_data
                    ) {

                        throw new Error(
                            "Invalid response received from AI service"
                        );

                    }

                    const invoiceData =
                        invoice.structured_data;

                    const aiMetadata =
                        normalizeAiMetadata(

                            invoice.ai_metadata || {}

                        );

                    console.log(
                        "\nSTRUCTURED DATA RECEIVED:"
                    );

                    console.log(
                        invoiceData
                    );

                    console.log(
                        "\nAI METADATA RECEIVED:"
                    );

                    console.log(
                        aiMetadata
                    );


                    // --------------------------------------
                    // NORMALIZED FIELDS
                    // --------------------------------------

                    const invoiceNumber =
                        unwrapValue(

                            invoiceData.invoice_number

                        ) || null;

                    const vendorName =
                        unwrapValue(

                            invoiceData.vendor_name

                        ) || null;


                    // --------------------------------------
                    // DUPLICATE CHECK
                    // SAME USER ONLY
                    // --------------------------------------

                    if (
                        invoiceNumber &&
                        vendorName
                    ) {

                        const existingInvoice =
                            await Invoice.findOne({

                                user:
                                    req.user.userId,

                                invoiceNumber,

                                "vendor.name":
                                    vendorName

                            });

                        if (existingInvoice) {

                            console.log(
                                "DUPLICATE INVOICE FOUND"
                            );

                            skippedDuplicates.push({

                                filename:
                                    file.originalname,

                                invoiceNumber,

                                vendorName

                            });

                            continue;

                        }

                    }


                   // --------------------------------------
// SAVE TO MONGODB
// --------------------------------------
// --------------------------------------
// SAVE TO MONGODB
// --------------------------------------

const savedInvoice =
    await Invoice.create({

        user:
            req.user.userId,

        filename:
            invoice.filename ||
            file.originalname,

        fileHash,

        invoiceNumber,

        invoiceDate:
            unwrapValue(
                invoiceData.invoice_date
            ) || null,

        vendor: {

            name:
                vendorName,

            address:
                unwrapValue(
                    invoiceData.vendor_address
                ) || null,

            gstin:
                unwrapValue(
                    invoiceData.vendor_gstin
                ) || null,

            phone:
                unwrapValue(
                    invoiceData.vendor_phone
                ) || null,

            email:
                unwrapValue(
                    invoiceData.vendor_email
                ) || null

        },

        customer: {

            name:
                unwrapValue(
                    invoiceData.customer_name
                ) || null,

            address:
                unwrapValue(
                    invoiceData.customer_address
                ) || null,

            gstin:
                unwrapValue(
                    invoiceData.customer_gstin
                ) || null

        },

        items:
            normalizeItems(
                unwrapValue(
                    invoiceData.items
                ) || []
            ),

        subtotal:
            cleanNumber(
                invoiceData.subtotal
            ),

        discount:
            cleanNumber(
                invoiceData.discount
            ) ?? 0,

        taxRate:
            cleanNumber(
                invoiceData.tax_rate
            ),

        tax:
            cleanNumber(
                invoiceData.tax
            ),

        totalAmount:
            cleanNumber(
                invoiceData.total
            ),

        extractedText:
            invoice.extracted_text ||
            "",

        aiMetadata,

        status:
            determineInvoiceStatus(
                invoiceData,
                aiMetadata
            )

    });


console.log(
    "\nINVOICE SAVED TO MONGODB"
);

invoices.push(
    savedInvoice
);

}

catch (fileError) {

    console.error(
        "\nFAILED TO PROCESS:",
        file.originalname
    );

    console.error(
        fileError.response?.data ||
        fileError.message
    );

       failedInvoices.push({

        filename:
            file.originalname,

        error:
            fileError.response?.data?.detail ||
            fileError.response?.data?.message ||
            fileError.message

    });

} // catch (fileError) close

} // for (const file of req.files) close
            // --------------------------------------
            // FINAL RESPONSE
            // --------------------------------------

            let message =
                "Invoices processed successfully";

            if (
                invoices.length === 0 &&
                skippedDuplicates.length > 0 &&
                failedInvoices.length === 0
            ) {

                message =
                    "All uploaded invoices were duplicates";

            }

            if (
                invoices.length === 0 &&
                failedInvoices.length > 0
            ) {

                return res.status(422).json({

                    message:
                        "No invoices could be processed",

                    count:
                        0,

                    invoices: [],

                    skippedDuplicates,

                    failedInvoices

                });

            }

                    return res.status(200).json({

                message,

                count:
                    invoices.length,

                invoices,

                skippedDuplicateCount:
                    skippedDuplicates.length,

                skippedDuplicates,

                failedCount:
                    failedInvoices.length,

                failedInvoices

            });

        } // outer try close

        catch (error) {

       

            console.error(
                "\nINVOICE PROCESSING ERROR:"
            );

            console.error(

                error.response?.data ||
                error.message

            );

            if (
                error instanceof
                multer.MulterError
            ) {

                return res.status(400).json({

                    message:
                        "Invoice upload failed",

                    error:
                        error.message

                });

            }

            return res.status(500).json({

                message:
                    "Invoice processing failed",

                error:
                    error.response?.data ||
                    error.message

            });

        }

        finally {

            // --------------------------------------
            // DELETE TEMPORARY FILES
            // --------------------------------------

            if (req.files) {

                for (
                    const file
                    of req.files
                ) {

                    if (
                        fs.existsSync(
                            file.path
                        )
                    ) {

                        try {

                            fs.unlinkSync(
                                file.path
                            );

                            console.log(

                                "Temporary file deleted:",

                                file.originalname

                            );

                        }

                        catch (cleanupError) {

                            console.error(

                                "Temporary file cleanup failed:",

                                cleanupError.message

                            );

                        }

                    }

                }

            }

        }

    }

);


// ==================================================
// GET ALL INVOICES
// SEARCH + FILTER + PAGINATION + SORTING
// GET /api/invoices
// ==================================================

router.get(

    "/",
     validateInvoiceQuery,

    async (req, res) => {

        try {

            const userId =
                req.user.userId;

            const search =
                req.query.search?.trim() || "";

            const status =
                req.query.status?.trim() || "";

            const sort =
                req.query.sort || "newest";

            const page =
                Math.max(
                    parseInt(req.query.page) || 1,
                    1
                );

            const limit =
                Math.min(
                    Math.max(
                        parseInt(req.query.limit) || 10,
                        1
                    ),
                    50
                );

            const skip =
                (page - 1) * limit;


            // --------------------------------------
            // BUILD FILTER
            // --------------------------------------

            const filter = {

                user:
                    userId

            };


            // --------------------------------------
            // STATUS FILTER
            // --------------------------------------

            if (
                status &&
                ["processed", "needs_review"]
                    .includes(status)
            ) {

                filter.status =
                    status;

            }


            // --------------------------------------
            // SEARCH FILTER
            // --------------------------------------

            if (search) {

                const searchRegex =
                    new RegExp(
                        search,
                        "i"
                    );

                filter.$or = [

                    {
                        invoiceNumber:
                            searchRegex
                    },

                    {
                        "vendor.name":
                            searchRegex
                    },

                    {
                        "customer.name":
                            searchRegex
                    },

                    {
                        filename:
                            searchRegex
                    }

                ];

            }


            // --------------------------------------
            // SORTING
            // --------------------------------------

            let sortOption = {

                createdAt:
                    -1

            };

            if (sort === "oldest") {

                sortOption = {

                    createdAt:
                        1

                };

            }

            else if (sort === "highest_amount") {

                sortOption = {

                    totalAmount:
                        -1

                };

            }

            else if (sort === "lowest_amount") {

                sortOption = {

                    totalAmount:
                        1

                };

            }


            // --------------------------------------
            // FETCH DATA + COUNT
            // --------------------------------------

            const [
                invoices,
                totalInvoices
            ] = await Promise.all([

                Invoice.find(filter)

                    .sort(sortOption)

                    .skip(skip)

                    .limit(limit),

                Invoice.countDocuments(
                    filter
                )

            ]);


            const totalPages =
                Math.ceil(
                    totalInvoices / limit
                );


            return res.status(200).json({

                message:
                    "Invoices fetched successfully",

                count:
                    invoices.length,

                totalInvoices,

                pagination: {

                    currentPage:
                        page,

                    totalPages,

                    limit,

                    hasNextPage:
                        page < totalPages,

                    hasPreviousPage:
                        page > 1

                },

                filters: {

                    search:
                        search || null,

                    status:
                        status || null,

                    sort

                },

                invoices

            });

        }

        catch (error) {

            console.error(
                "GET INVOICES ERROR:",
                error.message
            );

            return res.status(500).json({

                message:
                    "Failed to fetch invoices",

                error:
                    error.message

            });

        }

    }

);
     
// ==================================================
// GET INVOICE STATISTICS
// GET /api/invoices/stats
// ==================================================

router.get(

    "/stats",
    async (req, res) => {

        try {

            const userId =
                req.user.userId;

            const [
                totalInvoices,
                processedInvoices,
                needsReviewInvoices,
                confidenceResult,
                todayUploads
            ] = await Promise.all([

                Invoice.countDocuments({
                    user: userId
                }),

                Invoice.countDocuments({
                    user: userId,
                    status: "processed"
                }),

                Invoice.countDocuments({
                    user: userId,
                    status: "needs_review"
                }),

                Invoice.aggregate([

                    {
                        $match: {
                            user:
                                new mongoose.Types.ObjectId(
                                    userId
                                )
                        }
                    },

                    {
                        $group: {

                            _id: null,

                            averageConfidence: {
                                $avg:
                                    "$aiMetadata.overallConfidence"
                            }

                        }
                    }

                ]),

                Invoice.countDocuments({

                    user: userId,

                    createdAt: {

                        $gte:
                            new Date(
                                new Date()
                                    .setHours(
                                        0,
                                        0,
                                        0,
                                        0
                                    )
                            )

                    }

                })

            ]);

            const averageConfidence =
                confidenceResult.length > 0
                    ? confidenceResult[0]
                        .averageConfidence || 0
                    : 0;

            return res.status(200).json({

                message:
                    "Invoice statistics fetched successfully",

                stats: {

                    totalInvoices,

                    processedInvoices,

                    needsReviewInvoices,

                    averageConfidence:
                        Number(
                            averageConfidence.toFixed(4)
                        ),

                    averageConfidencePercentage:
                        Number(
                            (
                                averageConfidence * 100
                            ).toFixed(2)
                        ),

                    todayUploads

                }

            });

        }

        catch (error) {

            console.error(
                "STATS API ERROR:",
                error.message
            );

            return res.status(500).json({

                message:
                    "Failed to fetch invoice statistics",

                error:
                    error.message

            });

        }

    }

);
// ==================================================
// GET SINGLE INVOICE OF LOGGED-IN USER
// GET /api/invoices/:id
// ==================================================

router.get(

    "/:id",
    validateInvoiceId,

    async (req, res) => {

        try {

            const invoice =
                await Invoice.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user.userId

                });

            if (!invoice) {

                return res.status(404).json({

                    message:
                        "Invoice not found"

                });

            }

            return res.status(200).json({

                message:
                    "Invoice fetched successfully",

                invoice

            });

        }

        catch (error) {

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid invoice ID"

                });

            }

            return res.status(500).json({

                message:
                    "Failed to fetch invoice",

                error:
                    error.message

            });

        }

    }

);
const validateInvoiceUpdate = (req, res, next) => {

    const allowedFields = [

        "vendor",
        "customer",
        "invoiceNumber",
        "invoiceDate",
        "items",
        "subtotal",
        "discount",
        "taxRate",
        "tax",
        "totalAmount",
        "status"

    ];


    const receivedFields =
        Object.keys(req.body || {});


    if (receivedFields.length === 0) {

        return res.status(400).json({

            message:
                "At least one field is required"

        });

    }


    const invalidFields =
        receivedFields.filter(

            (field) =>
                !allowedFields.includes(field)

        );


    if (invalidFields.length > 0) {

        return res.status(400).json({

            message:
                "Invalid fields in request",

            invalidFields,

            allowedFields

        });

    }


    if (
        req.body.status &&
        !allowedStatuses.includes(
            req.body.status
        )
    ) {

        return res.status(400).json({

            message:
                "Invalid invoice status",

            allowedStatuses

        });

    }


    const numericFields = [

        "subtotal",
        "discount",
        "taxRate",
        "tax",
        "totalAmount"

    ];


    for (const field of numericFields) {

        if (
            req.body[field] !== undefined &&
            req.body[field] !== null &&
            (
                typeof req.body[field] !==
                    "number" ||
                !Number.isFinite(
                    req.body[field]
                ) ||
                req.body[field] < 0
            )
        ) {

            return res.status(400).json({

                message:
                    `${field} must be a non-negative number`

            });

        }

    }


    if (
        req.body.items !== undefined &&
        !Array.isArray(req.body.items)
    ) {

        return res.status(400).json({

            message:
                "Items must be an array"

        });

    }


    next();

};
// ==================================================
// UPDATE / REVIEW SINGLE INVOICE
// PATCH /api/invoices/:id
// ==================================================

router.patch(

    "/:id",
   validateInvoiceId,
     validateInvoiceUpdate,
    async (req, res) => {

        try {

            const invoice =
                await Invoice.findOne({

                    _id: req.params.id,

                    user: req.user.userId

                });


            if (!invoice) {

                return res.status(404).json({

                    message:
                        "Invoice not found"

                });

            }


            const {
                invoiceNumber,
                invoiceDate,
                vendor,
                customer,
                items,
                subtotal,
                discount,
                taxRate,
                tax,
                totalAmount
           } = req.body || {};


            // --------------------------------------
            // UPDATE BASIC FIELDS
            // --------------------------------------

            if (invoiceNumber !== undefined) {

                invoice.invoiceNumber =
                    invoiceNumber || null;

            }


            if (invoiceDate !== undefined) {

                invoice.invoiceDate =
                    invoiceDate || null;

            }


            // --------------------------------------
            // UPDATE VENDOR
            // --------------------------------------

            if (vendor) {

                invoice.vendor = {

                    ...invoice.vendor.toObject(),

                    ...vendor

                };

            }


            // --------------------------------------
            // UPDATE CUSTOMER
            // --------------------------------------

            if (customer) {

                invoice.customer = {

                    ...invoice.customer.toObject(),

                    ...customer

                };

            }


            // --------------------------------------
            // UPDATE ITEMS
            // --------------------------------------

            if (items !== undefined) {

                if (!Array.isArray(items)) {

                    return res.status(400).json({

                        message:
                            "Items must be an array"

                    });

                }

                invoice.items =
                    normalizeItems(items);

            }


            // --------------------------------------
            // UPDATE FINANCIAL FIELDS
            // --------------------------------------

            if (subtotal !== undefined) {

                invoice.subtotal =
                    cleanNumber(subtotal);

            }


            if (discount !== undefined) {

                invoice.discount =
                    cleanNumber(discount) ?? 0;

            }


            if (taxRate !== undefined) {

                invoice.taxRate =
                    cleanNumber(taxRate);

            }


            if (tax !== undefined) {

                invoice.tax =
                    cleanNumber(tax);

            }


            if (totalAmount !== undefined) {

                invoice.totalAmount =
                    cleanNumber(totalAmount);

            }


            // --------------------------------------
            // RE-CALCULATE STATUS AFTER REVIEW
            // --------------------------------------

            const missingCriticalFields =

                !invoice.vendor?.name ||

                !invoice.invoiceDate ||

                invoice.totalAmount == null;


            invoice.status =
                missingCriticalFields
                    ? "needs_review"
                    : "processed";


            const updatedInvoice =
                await invoice.save();


            return res.status(200).json({

                message:
                    "Invoice updated successfully",

                invoice:
                    updatedInvoice

            });

        }

        catch (error) {

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid invoice ID"

                });

            }


            return res.status(500).json({

                message:
                    "Failed to update invoice",

                error:
                    error.message

            });

        }

    }

);
// ==================================================
// DELETE SINGLE INVOICE OF LOGGED-IN USER
// DELETE /api/invoices/:id
// ==================================================

router.delete(

    "/:id",
        validateInvoiceId,


    async (req, res) => {

        try {

            const deletedInvoice =
                await Invoice.findOneAndDelete({

                    _id:
                        req.params.id,

                    user:
                        req.user.userId

                });

            if (!deletedInvoice) {

                return res.status(404).json({

                    message:
                        "Invoice not found"

                });

            }

            return res.status(200).json({

                message:
                    "Invoice deleted successfully",

                invoice:
                    deletedInvoice

            });

        }

        catch (error) {

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid invoice ID"

                });

            }

            return res.status(500).json({

                message:
                    "Failed to delete invoice",

                error:
                    error.message

            });

        }

    }

);


// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;