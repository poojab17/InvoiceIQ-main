// =====================================================
// INVOICE ROUTES
// =====================================================


// Express framework import
const express = require("express");


// Multer import
//
// Files receive aur save karne ke liye
const multer = require("multer");


// Tesseract.js import
//
// OCR ke liye
const Tesseract = require("tesseract.js");


// Sharp import
//
// Image preprocessing ke liye
const sharp = require("sharp");


// Path module import
//
// File paths safely create karne ke liye
const path = require("path");


// Express router create
const router = express.Router();


// =====================================================
// MULTER STORAGE CONFIGURATION
// =====================================================

const storage = multer.diskStorage({

    // Uploaded files yahan save hongi
    destination: "src/uploads/",


    // Unique filename create karna
    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;


        cb(null, uniqueName);
    }
});


// Multiple files upload middleware
const upload = multer({

    storage: storage

});


// =====================================================
// HELPER FUNCTIONS
// =====================================================


// Text ko clean karne ka function
function cleanText(text) {

    return text

        // Extra spaces remove
        .replace(/[ \t]+/g, " ")

        // Multiple blank lines remove
        .replace(/\n+/g, "\n")

        // Starting aur ending spaces remove
        .trim();
}


// =====================================================
// PHONE NUMBER EXTRACTION
// =====================================================

function extractPhoneNumbers(text) {

    return text.match(

        /\b(?:\d{3}[-.]\d{3}[-.]\d{4}|\d{5}[\s-]?\d{5})\b/g

    ) || [];
}


// =====================================================
// EMAIL EXTRACTION
// =====================================================

function extractEmails(text) {

    return text.match(

        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

    ) || [];
}


// =====================================================
// GST NUMBER EXTRACTION
// =====================================================

function extractGSTNumbers(text) {

    return text.match(

        /\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]\b/g

    ) || [];
}


// =====================================================
// PAN NUMBER EXTRACTION
// =====================================================

function extractPANNumbers(text) {

    return text.match(

        /\b[A-Z]{5}\d{4}[A-Z]\b/g

    ) || [];
}


// =====================================================
// INVOICE NUMBER EXTRACTION
// =====================================================

function extractInvoiceNumber(text) {

    const invoiceNumberMatch = text.match(

        /(?:invoice\s*(?:no|number)?|bill\s*(?:no|number)?|inv\s*(?:no|number)?)[\s:#.-]*([A-Z0-9/-]+)/i

    );


    if (invoiceNumberMatch) {

        return invoiceNumberMatch[1];
    }


    return null;
}


// =====================================================
// DATE EXTRACTION
// =====================================================

function extractDate(text) {

    const dateMatch = text.match(

        /\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/

    );


    if (dateMatch) {

        return dateMatch[0];
    }


    return null;
}


// =====================================================
// DUE DATE EXTRACTION
// =====================================================

function extractDueDate(text) {

    const dueDateMatch = text.match(

        /(?:due\s*date|payment\s*due)[\s:#-]*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/i

    );


    if (dueDateMatch) {

        return dueDateMatch[1];
    }


    return null;
}


// =====================================================
// CURRENCY EXTRACTION
// =====================================================

function extractCurrency(text) {

    if (text.includes("₹") || text.toLowerCase().includes("inr")) {

        return "INR";
    }


    if (text.includes("$") || text.toLowerCase().includes("usd")) {

        return "USD";
    }


    if (text.includes("€") || text.toLowerCase().includes("eur")) {

        return "EUR";
    }


    if (text.includes("£") || text.toLowerCase().includes("gbp")) {

        return "GBP";
    }


    return null;
}


// =====================================================
// TOTAL AMOUNT EXTRACTION
// =====================================================

function extractTotalAmount(text) {

    const totalMatch = text.match(

        /(?:grand\s*total|total\s*amount|amount\s*due|total|net\s*amount)[^\d]{0,20}([₹$€£]?\s?[\d,]+(?:\.\d{1,2})?)/i

    );


    if (totalMatch) {

        return totalMatch[1];
    }


    return null;
}


// =====================================================
// SUBTOTAL EXTRACTION
// =====================================================

function extractSubtotal(text) {

    const subtotalMatch = text.match(

        /(?:subtotal|sub\s*total)[^\d]{0,20}([₹$€£]?\s?[\d,]+(?:\.\d{1,2})?)/i

    );


    if (subtotalMatch) {

        return subtotalMatch[1];
    }


    return null;
}


// =====================================================
// TAX EXTRACTION
// =====================================================

function extractTax(text) {

    const taxMatch = text.match(

        /(?:tax|gst|cgst|sgst|igst)[^\d]{0,20}([₹$€£]?\s?[\d,]+(?:\.\d{1,2})?)/i

    );


    if (taxMatch) {

        return taxMatch[1];
    }


    return null;
}


// =====================================================
// DISCOUNT EXTRACTION
// =====================================================

function extractDiscount(text) {

    const discountMatch = text.match(

        /(?:discount|less)[^\d]{0,20}([₹$€£]?\s?[\d,]+(?:\.\d{1,2})?)/i

    );


    if (discountMatch) {

        return discountMatch[1];
    }


    return null;
}


// =====================================================
// SELLER EXTRACTION
// =====================================================

function extractSeller(text) {

    const lines = text

        .split("\n")

        .map(line => line.trim())

        .filter(line => line.length > 0);


    const sellerKeywords = [

        "seller",

        "vendor",

        "from",

        "supplier",

        "seller name"

    ];


    for (let i = 0; i < lines.length; i++) {

        const currentLine = lines[i].toLowerCase();


        for (const keyword of sellerKeywords) {

            if (currentLine.includes(keyword)) {

                return lines[i + 1] || null;
            }
        }
    }


    return null;
}


// =====================================================
// BUYER EXTRACTION
// =====================================================

function extractBuyer(text) {

    const lines = text

        .split("\n")

        .map(line => line.trim())

        .filter(line => line.length > 0);


    const buyerKeywords = [

        "buyer",

        "customer",

        "bill to",

        "billed to",

        "client"

    ];


    for (let i = 0; i < lines.length; i++) {

        const currentLine = lines[i].toLowerCase();


        for (const keyword of buyerKeywords) {

            if (currentLine.includes(keyword)) {

                return lines[i + 1] || null;
            }
        }
    }


    return null;
}


// =====================================================
// PAYMENT TERMS EXTRACTION
// =====================================================

function extractPaymentTerms(text) {

    const lines = text

        .split("\n")

        .map(line => line.trim());


    for (const line of lines) {

        const lowerLine = line.toLowerCase();


        if (

            lowerLine.includes("payment terms") ||

            lowerLine.includes("terms of payment") ||

            lowerLine.includes("net 30") ||

            lowerLine.includes("net 15") ||

            lowerLine.includes("net 7")

        ) {

            return line;
        }
    }


    return null;
}


// =====================================================
// PAYMENT METHOD EXTRACTION
// =====================================================

function extractPaymentMethod(text) {

    const lowerText = text.toLowerCase();


    if (lowerText.includes("upi")) {

        return "UPI";
    }


    if (lowerText.includes("cash")) {

        return "Cash";
    }


    if (lowerText.includes("bank transfer")) {

        return "Bank Transfer";
    }


    if (lowerText.includes("credit card")) {

        return "Credit Card";
    }


    if (lowerText.includes("debit card")) {

        return "Debit Card";
    }


    return null;
}


// =====================================================
// NOTES EXTRACTION
// =====================================================

function extractNotes(text) {

    const lines = text

        .split("\n")

        .map(line => line.trim());


    for (let i = 0; i < lines.length; i++) {

        if (lines[i].toLowerCase().includes("note")) {

            return lines[i + 1] || null;
        }
    }


    return null;
}


// =====================================================
// MAIN INVOICE DATA EXTRACTION
// =====================================================

function extractInvoiceData(text) {


    // Clean OCR text
    const cleanedText = cleanText(text);


    return {


        // Invoice unique number
        invoiceNumber:

            extractInvoiceNumber(cleanedText),


        // Invoice issue date
        invoiceDate:

            extractDate(cleanedText),


        // Payment due date
        dueDate:

            extractDueDate(cleanedText),


        // Seller/vendor
        seller:

            extractSeller(cleanedText),


        // Buyer/customer
        buyer:

            extractBuyer(cleanedText),


        // Products/services
        //
        // Abhi empty array.
        // Isko later intelligent item extraction se fill karenge.
        items: [],


        // Subtotal
        subtotal:

            extractSubtotal(cleanedText),


        // Discount
        discount:

            extractDiscount(cleanedText),


        // Tax
        tax:

            extractTax(cleanedText),


        // Additional charges
        additionalCharges: null,


        // Final payable amount
        totalAmount:

            extractTotalAmount(cleanedText),


        // Currency
        currency:

            extractCurrency(cleanedText),


        // Phone numbers
        phoneNumbers:

            extractPhoneNumbers(cleanedText),


        // Email addresses
        emailAddresses:

            extractEmails(cleanedText),


        // GST numbers
        gstNumbers:

            extractGSTNumbers(cleanedText),


        // PAN numbers
        panNumbers:

            extractPANNumbers(cleanedText),


        // Payment terms
        paymentTerms:

            extractPaymentTerms(cleanedText),


        // Payment method
        paymentMethod:

            extractPaymentMethod(cleanedText),


        // Notes
        notes:

            extractNotes(cleanedText)

    };
}


// =====================================================
// MULTIPLE INVOICE UPLOAD + OCR
// =====================================================


router.post(

    "/upload",


    // Maximum 5 invoices
    //
    // Postman field name:
    //
    // invoices
    upload.array("invoices", 5),


    async (req, res) => {


        try {


            console.log(

                "OCR processing started..."

            );


            const results = [];


            // Har invoice ko process karna
            for (const file of req.files) {


                // Processed image path
                const processedImagePath =

                    file.path + "-processed.png";


                // Image preprocessing
                await sharp(file.path)

                    .grayscale()

                    .normalize()

                    .sharpen()

                    .toFile(processedImagePath);


                // OCR
                const result =

                    await Tesseract.recognize(

                        processedImagePath,

                        "eng"

                    );


                // Raw OCR text
                const extractedText =

                    result.data.text;


                // Structured data
                const invoiceData =

                    extractInvoiceData(

                        extractedText

                    );


                // Final result
                results.push({


                    filename:

                        file.originalname,


                    extractedText:

                        extractedText,


                    invoiceData:

                        invoiceData

                });

            }


            // Success response
            res.json({


                message:

                    "Invoices processed successfully 🚀",


                invoices:

                    results

            });


        } catch (error) {


            console.error(error);


            res.status(500).json({


                message:

                    "OCR processing failed",


                error:

                    error.message

            });

        }

    }

);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;