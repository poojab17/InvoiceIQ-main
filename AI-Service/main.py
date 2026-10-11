import os
import re
import time
import uuid
from pathlib import Path
from typing import Any, Optional

import pytesseract
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pytesseract import Output

from invoice_parser import clean_amount, normalize_date, normalize_whitespace
from invoice_parser import extract_invoice_data
from predict_invoice import predict_invoice


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MODEL_VERSION = "layoutlm-sroie-v1"

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

# Change this path only if Tesseract is installed elsewhere.
DEFAULT_TESSERACT_PATH = (
    "/opt/homebrew/bin/tesseract"
)

if os.path.exists(DEFAULT_TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = (
        DEFAULT_TESSERACT_PATH
    )


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="InvoiceIQ AI Service",
    version="1.0.0",
    description=(
        "OCR, rule-based parsing and LayoutLM-powered "
        "invoice information extraction service."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GENERAL HELPERS
# ============================================================

def safe_float(value: Any) -> float:
    """
    Safely convert a confidence-like value to float.
    """

    try:
        result = float(value)
    except (TypeError, ValueError):
        return 0.0

    return max(0.0, min(result, 1.0))


def safe_filename(filename: Optional[str]) -> str:
    """
    Remove unsafe path components from an uploaded filename.
    """

    original_name = Path(
        filename or "invoice"
    ).name

    cleaned_name = re.sub(
        r"[^A-Za-z0-9._\-]",
        "_",
        original_name,
    )

    if not cleaned_name:
        cleaned_name = "invoice"

    return cleaned_name


def validate_upload(
    filename: str,
    file_size: int,
) -> None:
    """
    Validate extension and upload size.
    """

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. Upload JPG, JPEG, PNG, "
                "WEBP, BMP, TIF or TIFF images."
            ),
        )

    if file_size <= 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded invoice file is empty.",
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Invoice image must be 10 MB or smaller.",
        )


def save_uploaded_file(
    file_bytes: bytes,
    original_filename: str,
) -> Path:
    """
    Save an uploaded image with a collision-safe name.
    """

    unique_name = (
        f"{uuid.uuid4().hex}_"
        f"{safe_filename(original_filename)}"
    )

    file_path = UPLOAD_DIR / unique_name
    file_path.write_bytes(file_bytes)

    return file_path


# ============================================================
# OCR LAYOUT RECONSTRUCTION
# ============================================================

def reconstruct_ocr_lines(
    ocr_data: dict,
    image_width: int,
) -> str:
    """
    Reconstruct OCR text using word bounding boxes.

    A vertical separator is inserted when a large horizontal
    gap suggests a new invoice column.
    """

    grouped_lines: dict[
        tuple[int, int, int],
        list[dict],
    ] = {}

    word_count = len(
        ocr_data.get("text", [])
    )

    for index in range(word_count):
        text = normalize_whitespace(
            ocr_data["text"][index]
        )

        if not text:
            continue

        try:
            confidence = float(
                ocr_data["conf"][index]
            )
        except (TypeError, ValueError):
            confidence = -1.0

        if confidence < 0:
            continue

        key = (
            int(ocr_data["block_num"][index]),
            int(ocr_data["par_num"][index]),
            int(ocr_data["line_num"][index]),
        )

        grouped_lines.setdefault(
            key,
            [],
        ).append(
            {
                "text": text,
                "left": int(
                    ocr_data["left"][index]
                ),
                "top": int(
                    ocr_data["top"][index]
                ),
                "width": int(
                    ocr_data["width"][index]
                ),
                "height": int(
                    ocr_data["height"][index]
                ),
            }
        )

    reconstructed_lines = []

    sorted_groups = sorted(
        grouped_lines.items(),
        key=lambda item: (
            min(
                word["top"]
                for word in item[1]
            ),
            min(
                word["left"]
                for word in item[1]
            ),
        ),
    )

    for _, words in sorted_groups:
        words = sorted(
            words,
            key=lambda word: word["left"],
        )

        if not words:
            continue

        line_parts = []
        previous_right = None

        median_height = sorted(
            word["height"]
            for word in words
        )[len(words) // 2]

        dynamic_gap_threshold = max(
            int(image_width * 0.055),
            int(median_height * 2.8),
            45,
        )

        for word in words:
            if previous_right is not None:
                gap = word["left"] - previous_right

                if gap >= dynamic_gap_threshold:
                    line_parts.append("|")

            line_parts.append(word["text"])

            previous_right = (
                word["left"]
                + word["width"]
            )

        line = normalize_whitespace(
            " ".join(line_parts)
        )

        if line:
            reconstructed_lines.append(line)

    return "\n".join(
        reconstructed_lines
    )


def extract_text_with_ocr(
    image_path: Path,
) -> str:
    """
    Run Tesseract OCR and rebuild readable invoice rows.
    """

    print("\n========== OCR DEBUG ==========")
    print(f"IMAGE PATH: {image_path}")

    try:
        with Image.open(image_path) as image:
            image = image.convert("RGB")

            print(
                f"IMAGE OPENED: {image.size}"
            )

            ocr_data = pytesseract.image_to_data(
                image,
                output_type=Output.DICT,
                config="--oem 3 --psm 4",
            )

            extracted_text = reconstruct_ocr_lines(
                ocr_data,
                image.width,
            )

    except Exception as error:
        raise RuntimeError(
            f"OCR failed: {error}"
        ) from error

    print("\nOCR COMPLETED")
    print("\nEXTRACTED OCR TEXT:\n")
    print(extracted_text)

    return extracted_text


# ============================================================
# LAYOUTLM VALUE VALIDATION
# ============================================================

def get_layoutlm_field(
    layoutlm_data: dict,
    field_name: str,
    minimum_confidence: float,
) -> tuple[Optional[str], float]:
    """
    Read and validate a LayoutLM field.
    """

    field_data = layoutlm_data.get(
        field_name,
        {},
    )

    if not isinstance(field_data, dict):
        return None, 0.0

    value = normalize_whitespace(
        field_data.get("value")
    )

    confidence = safe_float(
        field_data.get("confidence")
    )

    if not value:
        return None, confidence

    if confidence < minimum_confidence:
        return None, confidence

    return value, confidence


def is_valid_vendor_candidate(
    value: Any,
) -> bool:
    cleaned = normalize_whitespace(value)

    if not cleaned:
        return False

    if len(cleaned) > 100:
        return False

    if not re.search(
        r"[A-Za-z]",
        cleaned,
    ):
        return False

    blocked_labels = {
        "invoice",
        "tax invoice",
        "invoice date",
        "total",
        "address",
        "customer",
    }

    if cleaned.lower() in blocked_labels:
        return False

    return True


def is_valid_total_candidate(
    value: Any,
) -> bool:
    """
    Reject phone numbers, dates and non-monetary LayoutLM totals.
    """

    cleaned = normalize_whitespace(value)

    if not cleaned:
        return False

    if re.fullmatch(
        r"\+?\d[\d\s\-()]{7,}",
        cleaned,
    ):
        return False

    if re.search(
        r"\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b",
        cleaned,
    ):
        return False

    amount = clean_amount(cleaned)

    return amount is not None


# ============================================================
# PARSER + LAYOUTLM MERGE
# ============================================================

def merge_parser_and_layoutlm(
    parser_data: dict,
    layoutlm_data: dict,
) -> dict:
    """
    Parser-first merge strategy.

    LayoutLM is used only as a validated fallback for fields
    available in the SROIE model: company, address, date, total.
    """

    structured_data = {
        "vendor_name": parser_data.get(
            "vendor_name"
        ),
        "invoice_number": parser_data.get(
            "invoice_number"
        ),
        "invoice_date": parser_data.get(
            "invoice_date"
        ),
        "customer_name": parser_data.get(
            "customer_name"
        ),
        "customer_address": parser_data.get(
            "customer_address"
        ),
        "customer_gstin": parser_data.get(
            "customer_gstin"
        ),
        "items": parser_data.get(
            "items",
            [],
        ),
        "subtotal": parser_data.get(
            "subtotal"
        ),
        "discount": parser_data.get(
            "discount"
        ),
        "tax_rate": parser_data.get(
            "tax_rate"
        ),
        "tax": parser_data.get(
            "tax"
        ),
        "total": parser_data.get(
            "total"
        ),
    }

    company_value, _ = get_layoutlm_field(
        layoutlm_data,
        "company",
        minimum_confidence=0.65,
    )

    if (
        not structured_data["vendor_name"]
        and is_valid_vendor_candidate(
            company_value
        )
    ):
        structured_data["vendor_name"] = (
            company_value
        )

    address_value, _ = get_layoutlm_field(
        layoutlm_data,
        "address",
        minimum_confidence=0.65,
    )

    if (
        not structured_data["customer_address"]
        and address_value
    ):
        structured_data["customer_address"] = (
            address_value
        )

    date_value, _ = get_layoutlm_field(
        layoutlm_data,
        "date",
        minimum_confidence=0.60,
    )

    if not structured_data["invoice_date"]:
        normalized_layout_date = normalize_date(
            date_value
        )

        if normalized_layout_date:
            structured_data["invoice_date"] = (
                normalized_layout_date
            )

    total_value, _ = get_layoutlm_field(
        layoutlm_data,
        "total",
        minimum_confidence=0.60,
    )

    if (
        structured_data["total"] is None
        and is_valid_total_candidate(
            total_value
        )
    ):
        structured_data["total"] = clean_amount(
            total_value
        )

    return structured_data


# ============================================================
# CONFIDENCE METADATA
# ============================================================

def build_field_confidence(
    structured_data: dict,
    parser_data: dict,
    layoutlm_data: dict,
) -> dict:
    """
    Generate field confidence scores for the final result.
    """

    field_confidence = {
        "vendor_name": 0.0,
        "invoice_number": 0.0,
        "invoice_date": 0.0,
        "customer_name": 0.0,
        "customer_address": 0.0,
        "customer_gstin": 0.0,
        "items": 0.0,
        "subtotal": 0.0,
        "discount": 0.0,
        "tax_rate": 0.0,
        "tax": 0.0,
        "total": 0.0,
    }

    if structured_data.get("vendor_name"):
        if parser_data.get("vendor_name"):
            field_confidence["vendor_name"] = 0.95
        else:
            field_confidence["vendor_name"] = safe_float(
                layoutlm_data.get(
                    "company",
                    {},
                ).get(
                    "confidence",
                    0.0,
                )
            )

    if structured_data.get("invoice_number"):
        field_confidence["invoice_number"] = 0.95

    if structured_data.get("invoice_date"):
        if parser_data.get("invoice_date"):
            field_confidence["invoice_date"] = 0.95
        else:
            field_confidence["invoice_date"] = safe_float(
                layoutlm_data.get(
                    "date",
                    {},
                ).get(
                    "confidence",
                    0.0,
                )
            )

    if structured_data.get("customer_name"):
        field_confidence["customer_name"] = 0.90

    if structured_data.get("customer_address"):
        field_confidence["customer_address"] = 0.85

    if structured_data.get("customer_gstin"):
        field_confidence["customer_gstin"] = 0.98

    items = structured_data.get(
        "items",
        [],
    )

    if items:
        complete_items = sum(
            1
            for item in items
            if item.get("name")
            and item.get(
                "taxable_value"
            ) is not None
        )

        field_confidence["items"] = round(
            complete_items / len(items),
            4,
        )

    if structured_data.get("subtotal") is not None:
        if parser_data.get("subtotal") is not None:
            field_confidence["subtotal"] = 0.95
        elif items:
            field_confidence["subtotal"] = 0.90

    if structured_data.get("discount") is not None:
        field_confidence["discount"] = 0.90

    if structured_data.get("tax_rate") is not None:
        field_confidence["tax_rate"] = 0.95

    if structured_data.get("tax") is not None:
        if parser_data.get("tax") is not None:
            field_confidence["tax"] = 0.95
        else:
            field_confidence["tax"] = 0.88

    if structured_data.get("total") is not None:
        if parser_data.get("total") is not None:
            field_confidence["total"] = 0.95
        elif structured_data.get("subtotal") is not None:
            field_confidence["total"] = 0.90
        else:
            field_confidence["total"] = safe_float(
                layoutlm_data.get(
                    "total",
                    {},
                ).get(
                    "confidence",
                    0.0,
                )
            )

    return {
        key: round(
            safe_float(value),
            4,
        )
        for key, value in field_confidence.items()
    }

def calculate_overall_confidence(
    field_confidence: dict,
) -> float:
    """
    Calculate confidence using both:
    1. Accuracy of extracted fields
    2. Completeness of expected invoice fields
    """

    important_fields = [
        "vendor_name",
        "invoice_number",
        "invoice_date",
        "customer_name",
        "items",
        "subtotal",
        "tax",
        "total",
    ]

    extracted_scores = [
        float(field_confidence.get(field, 0))
        for field in important_fields
        if float(field_confidence.get(field, 0)) > 0
    ]

    if not extracted_scores:
        return 0.0

    extraction_quality = (
        sum(extracted_scores)
        / len(extracted_scores)
    )

    completeness = (
        len(extracted_scores)
        / len(important_fields)
    )

    overall_confidence = (
        extraction_quality * 0.60
        + completeness * 0.40
    )

    return round(
        overall_confidence,
        4,
    )

# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root() -> dict:
    return {
        "message": "InvoiceIQ AI Service is running",
        "status": "success",
        "model_version": MODEL_VERSION,
    }


@app.get("/health")
def health() -> dict:
    return {
        "status": "healthy",
        "service": "InvoiceIQ AI Service",
        "model_version": MODEL_VERSION,
    }


@app.post("/process-invoice")
async def process_invoice(
    file: UploadFile = File(...),
) -> dict:
    """
    Process a single invoice image through OCR, parser,
    LayoutLM and confidence metadata generation.
    """

    started_at = time.perf_counter()
    saved_file_path: Optional[Path] = None

    original_filename = safe_filename(
        file.filename
    )

    print("\n===================================")
    print("INVOICE PROCESSING STARTED")
    print(f"Filename: {original_filename}")

    try:
        file_bytes = await file.read()

        validate_upload(
            original_filename,
            len(file_bytes),
        )

        saved_file_path = save_uploaded_file(
            file_bytes,
            original_filename,
        )

        print("File saved successfully")

        extracted_text = extract_text_with_ocr(
            saved_file_path
        )

        parser_data = extract_invoice_data(
            extracted_text
        )

        print("\nPARSER DATA:")
        print(parser_data)

        print("\nRUNNING LAYOUTLM...")

        try:
            layoutlm_data = predict_invoice(
                str(saved_file_path)
            )
        except Exception as layout_error:
            print(
                "LAYOUTLM ERROR:",
                str(layout_error),
            )

            layoutlm_data = {
                "company": {
                    "value": "",
                    "confidence": 0.0,
                },
                "address": {
                    "value": "",
                    "confidence": 0.0,
                },
                "date": {
                    "value": "",
                    "confidence": 0.0,
                },
                "total": {
                    "value": "",
                    "confidence": 0.0,
                },
                "overall_confidence": 0.0,
            }

        print("\nLAYOUTLM DATA:")
        print(layoutlm_data)

        structured_invoice = (
            merge_parser_and_layoutlm(
                parser_data,
                layoutlm_data,
            )
        )

        field_confidence = build_field_confidence(
            structured_invoice,
            parser_data,
            layoutlm_data,
        )

        overall_confidence = (
            calculate_overall_confidence(
                field_confidence
            )
        )

        processing_time_ms = round(
            (
                time.perf_counter()
                - started_at
            )
            * 1000
        )

        ai_metadata = {
            "overall_confidence": (
                overall_confidence
            ),
            "field_confidence": (
                field_confidence
            ),
            "model_version": MODEL_VERSION,
            "processing_time_ms": (
                processing_time_ms
            ),
        }

        invoice_data = {
            "filename": original_filename,
            "extracted_text": extracted_text,
            "parser_data": parser_data,
            "layoutlm_data": layoutlm_data,
            "structured_data": structured_invoice,
            "ai_metadata": ai_metadata,
        }

        print("\nFINAL STRUCTURED DATA:")
        print(structured_invoice)

        print("\nAI METADATA:")
        print(ai_metadata)

        print(
            f"\nPROCESSING TIME: "
            f"{processing_time_ms} ms"
        )

        print(
            "\nINVOICE PROCESSING COMPLETED"
        )

        return {
            "message": (
                "Invoice processed successfully"
            ),
            "invoice": invoice_data,
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            "\nINVOICE PROCESSING ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Invoice processing failed: "
                f"{error}"
            ),
        ) from error

    finally:
        await file.close()

        if (
            saved_file_path
            and saved_file_path.exists()
        ):
            try:
                saved_file_path.unlink()
                print(
                    "Temporary file deleted"
                )
            except OSError as cleanup_error:
                print(
                    "Temporary file cleanup failed:",
                    cleanup_error,
                )