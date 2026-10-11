import re
import pytesseract

from pathlib import Path
from PIL import Image


BASE_DIR = Path(__file__).parent


def extract_amount(text, patterns):
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(",", ""))
            except (ValueError, AttributeError):
                pass
    return None


def predict_invoice(image_path):

    print(f"Processing invoice: {image_path}")

    image = Image.open(image_path).convert("RGB")

    # OCR
    text = pytesseract.image_to_string(image)

    print(f"OCR extracted {len(text)} characters")

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    full_text = "\n".join(lines)

    # ---------------------------------------------------------
    # Invoice number
    # ---------------------------------------------------------

    invoice_number = None

    invoice_patterns = [
        r"(?:invoice\s*(?:no|number|#)?|inv\s*(?:no|#)?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\/\-_]+)",
        r"(?:bill\s*(?:no|number|#)?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\/\-_]+)",
    ]

    for pattern in invoice_patterns:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            invoice_number = match.group(1).strip()
            break

    # ---------------------------------------------------------
    # Date
    # ---------------------------------------------------------

    date = None

    date_patterns = [
        r"\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b",
        r"\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b",
        r"\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}\b",
    ]

    for pattern in date_patterns:
        match = re.search(pattern, full_text)
        if match:
            date = match.group(0)
            break

    # ---------------------------------------------------------
    # Total
    # ---------------------------------------------------------

    total = extract_amount(
        full_text,
        [
            r"(?:grand\s+total|total\s+amount|amount\s+due|balance\s+due)\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d{1,2})?)",
            r"(?:total)\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d{1,2})?)",
        ],
    )

    # ---------------------------------------------------------
    # Tax
    # ---------------------------------------------------------

    tax = extract_amount(
        full_text,
        [
            r"(?:gst|tax|vat)\s*(?:amount)?\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d{1,2})?)",
        ],
    )

    # ---------------------------------------------------------
    # Subtotal
    # ---------------------------------------------------------

    subtotal = extract_amount(
        full_text,
        [
            r"(?:subtotal|sub[\-\s]?total)\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d{1,2})?)",
        ],
    )

    # ---------------------------------------------------------
    # Currency
    # ---------------------------------------------------------

    if "₹" in full_text or "INR" in full_text.upper() or "RS." in full_text.upper():
        currency = "INR"
    elif "$" in full_text or "USD" in full_text.upper():
        currency = "USD"
    elif "€" in full_text or "EUR" in full_text.upper():
        currency = "EUR"
    elif "£" in full_text or "GBP" in full_text.upper():
        currency = "GBP"
    else:
        currency = None

    # ---------------------------------------------------------
    # Vendor
    # ---------------------------------------------------------

    vendor = None

    # Usually the first meaningful line on an invoice is the
    # company/vendor name.
    if lines:
        ignored = {
            "invoice",
            "tax invoice",
            "bill",
            "receipt",
        }

        for line in lines[:8]:
            cleaned = line.strip()

            if (
                cleaned.lower() not in ignored
                and len(cleaned) >= 2
                and not re.match(r"^[\d\s\-/:]+$", cleaned)
            ):
                vendor = cleaned
                break

    # ---------------------------------------------------------
    # Return
    # ---------------------------------------------------------

    result = {
        "invoice_number": invoice_number,
        "date": date,
        "vendor": vendor,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "currency": currency,
        "raw_text": full_text,
    }

    print("Invoice extracted:")
    print(result)

    return result
