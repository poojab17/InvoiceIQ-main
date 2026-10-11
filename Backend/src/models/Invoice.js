const mongoose = require("mongoose");


// ==================================================
// ITEM SCHEMA
// ==================================================

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: null
        },

        description: {
            type: String,
            trim: true,
            default: null
        },

        quantity: {
            type: Number,
            default: null,
            min: 0
        },

        unit: {
            type: String,
            trim: true,
            default: null
        },

        rate: {
            type: Number,
            default: null,
            min: 0
        },

        unitPrice: {
            type: Number,
            default: null,
            min: 0
        },

        taxRate: {
            type: Number,
            default: null,
            min: 0,
            max: 100
        },

        taxableValue: {
            type: Number,
            default: null,
            min: 0
        },

        amount: {
            type: Number,
            default: null,
            min: 0
        }
    },
    {
        _id: false
    }
);


// ==================================================
// FIELD CONFIDENCE SCHEMA
// ==================================================

const fieldConfidenceSchema = new mongoose.Schema(
    {
        vendorName: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        invoiceNumber: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        invoiceDate: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        customerName: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        customerAddress: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        customerGstin: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        items: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        subtotal: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        tax: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        total: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        }
    },
    {
        _id: false
    }
);


// ==================================================
// AI METADATA SCHEMA
// ==================================================

const aiMetadataSchema = new mongoose.Schema(
    {
        overallConfidence: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },

        fieldConfidence: {
            type: fieldConfidenceSchema,
            default: () => ({})
        },

        modelVersion: {
            type: String,
            trim: true,
            default: null
        },

        processingTimeMs: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        _id: false
    }
);


// ==================================================
// INVOICE SCHEMA
// ==================================================

const invoiceSchema = new mongoose.Schema(
    {
        // ----------------------------------------------
        // OWNER
        // ----------------------------------------------

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },


        // ----------------------------------------------
        // FILE INFORMATION
        // ----------------------------------------------

        filename: {
            type: String,
            required: true,
            trim: true
        },

        fileHash: {
            type: String,
            trim: true,
            default: null
        },


        // ----------------------------------------------
        // INVOICE DETAILS
        // ----------------------------------------------

        invoiceNumber: {
            type: String,
            trim: true,
            default: null
        },

        invoiceDate: {
            type: String,
            trim: true,
            default: null
        },


        // ----------------------------------------------
        // VENDOR DETAILS
        // ----------------------------------------------

        vendor: {
            name: {
                type: String,
                trim: true,
                default: null
            },

            address: {
                type: String,
                trim: true,
                default: null
            },

            gstin: {
                type: String,
                trim: true,
                uppercase: true,
                default: null
            },

            phone: {
                type: String,
                trim: true,
                default: null
            },

            email: {
                type: String,
                trim: true,
                lowercase: true,
                default: null
            }
        },


        // ----------------------------------------------
        // CUSTOMER DETAILS
        // ----------------------------------------------

        customer: {
            name: {
                type: String,
                trim: true,
                default: null
            },

            address: {
                type: String,
                trim: true,
                default: null
            },

            gstin: {
                type: String,
                trim: true,
                uppercase: true,
                default: null
            }
        },


        // ----------------------------------------------
        // ITEMS
        // ----------------------------------------------

        items: {
            type: [itemSchema],
            default: []
        },


        // ----------------------------------------------
        // FINANCIAL DETAILS
        // ----------------------------------------------

        subtotal: {
            type: Number,
            default: null,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        taxRate: {
            type: Number,
            default: null,
            min: 0,
            max: 100
        },

        tax: {
            type: Number,
            default: null,
            min: 0
        },

        totalAmount: {
            type: Number,
            default: null,
            min: 0
        },


        // ----------------------------------------------
        // RAW OCR TEXT
        // ----------------------------------------------

        extractedText: {
            type: String,
            default: ""
        },


        // ----------------------------------------------
        // AI METADATA
        // ----------------------------------------------

        aiMetadata: {
            type: aiMetadataSchema,
            default: () => ({})
        },


        // ----------------------------------------------
        // REVIEW STATUS
        // ----------------------------------------------

        status: {
            type: String,

            enum: [
                "processed",
                "needs_review",
                "verified"
            ],

            default: "processed"
        }
    },
    {
        timestamps: true
    }
);


// ==================================================
// INDEXES
// ==================================================

invoiceSchema.index(
    {
        user: 1,
        createdAt: -1
    }
);


invoiceSchema.index(
    {
        user: 1,
        fileHash: 1
    },
    {
        unique: true,

        partialFilterExpression: {
            fileHash: {
                $type: "string"
            }
        }
    }
);


// ==================================================
// EXPORT MODEL
// ==================================================

module.exports = mongoose.model(
    "Invoice",
    invoiceSchema
);