import re
from datetime import datetime
from typing import Any, Optional


# ============================================================
# CONSTANTS
# ============================================================

INVALID_VALUE_LABELS = {
    "invoice",
    "tax invoice",
    "original for recipient",
    "invoice details",
    "invoice date",
    "invoice no",
    "invoice number",
    "invoice #",
    "bill no",
    "bill number",
    "bill to",
    "billed to",
    "ship to",
    "sold to",
    "customer",
    "customer detail",
    "customer details",
    "buyer",
    "from",
    "to",
    "vendor",
    "supplier",
    "seller",
    "subtotal",
    "sub total",
    "tax",
    "total",
    "grand total",
    "net total",
    "amount due",
    "description",
    "quantity",
    "qty",
    "rate",
    "amount",
    "date",
}

VENDOR_LABELS = {
    "from",
    "vendor",
    "vendor name",
    "seller",
    "supplier",
    "issued by",
    "company",
}

CUSTOMER_LABELS = {
    "bill to",
    "billed to",
    "buyer",
    "customer",
    "customer detail",
    "customer details",
    "sold to",
    "invoice to",
    "m/s",
}

ADDRESS_STOP_LABELS = {
    "invoice details",
    "invoice no",
    "invoice number",
    "invoice date",
    "challan no",
    "challan date",
    "e-way bill no",
    "eway bill no",
    "phone",
    "mobile",
    "gstin",
    "gst no",
    "place of supply",
    "transport",
    "transport id",
    "description",
    "product",
    "products",
    "product/service",
    "product/services",
    "name of product / service",
    "hsn",
    "hsn / sac",
    "qty",
    "quantity",
    "subtotal",
    "tax",
    "total",
}

ITEM_STOP_PREFIXES = (
    "subtotal",
    "sub total",
    "discount",
    "taxable amount",
    "cgst",
    "sgst",
    "igst",
    "tax",
    "grand total",
    "net total",
    "total",
    "amount due",
    "total in words",
    "bank details",
    "terms and conditions",
)

MONTH_PATTERN = (
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
    r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|"
    r"Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
)

AMOUNT_PATTERN = (
    r"[-+]?\s*(?:₹|Rs\.?|INR|RM|\$|€|£)?\s*"
    r"[\d,]+(?:\.\d{1,2})?"
)


# ============================================================
# GENERAL HELPERS
# ============================================================

def normalize_whitespace(value: Any) -> Optional[str]:
    if value is None:
        return None

    cleaned = re.sub(r"\s+", " ", str(value)).strip()
    return cleaned or None


def normalize_label(value: Any) -> str:
    cleaned = normalize_whitespace(value)

    if not cleaned:
        return ""

    cleaned = cleaned.lower().strip()
    cleaned = re.sub(r"[\s:;#.\-_]+$", "", cleaned)

    return cleaned.strip()


def is_invalid_value(value: Any) -> bool:
    cleaned = normalize_whitespace(value)

    if not cleaned:
        return True

    normalized = normalize_label(cleaned)

    if normalized in INVALID_VALUE_LABELS:
        return True

    if re.fullmatch(r"[\W_]+", cleaned):
        return True

    if len(cleaned) == 1 and not cleaned.isalnum():
        return True

    return False


def clean_amount(value: Any) -> Optional[float]:
    if value is None:
        return None

    cleaned = normalize_whitespace(value)

    if not cleaned:
        return None

    if re.fullmatch(r"\+?\d[\d\s\-()]{7,}", cleaned):
        return None

    cleaned = re.sub(
        r"(?i)(₹|rs\.?|inr|rm|usd|eur|gbp|\$|€|£)",
        "",
        cleaned,
    )

    cleaned = cleaned.replace(",", "")
    cleaned = cleaned.replace(" ", "")
    cleaned = cleaned.replace("O", "0")
    cleaned = cleaned.replace("o", "0")
    cleaned = re.sub(r"[^0-9.\-]", "", cleaned)

    if not cleaned or cleaned in {"-", ".", "-."}:
        return None

    if cleaned.count(".") > 1:
        parts = cleaned.split(".")
        cleaned = "".join(parts[:-1]) + "." + parts[-1]

    try:
        result = float(cleaned)

        if result < 0:
            return None

        return round(result, 2)

    except (TypeError, ValueError):
        return None


def clean_percentage(value: Any) -> Optional[float]:
    if value is None:
        return None

    match = re.search(r"\d+(?:\.\d+)?", str(value))

    if not match:
        return None

    percentage = float(match.group())

    if percentage < 0 or percentage > 100:
        return None

    return round(percentage, 2)


def split_columns(line: Any) -> list[str]:
    cleaned = normalize_whitespace(line)

    if not cleaned:
        return []

    return [
        part.strip()
        for part in cleaned.split("|")
        if part.strip()
    ]


def clean_entity_name(value: Any) -> Optional[str]:
    cleaned = normalize_whitespace(value)

    if not cleaned:
        return None

    cleaned = re.sub(
        r"^[\W_]+|[\W_]+$",
        "",
        cleaned,
    ).strip()

    if is_invalid_value(cleaned):
        return None

    if not re.search(r"[A-Za-z]", cleaned):
        return None

    return cleaned


def looks_like_address_line(value: Any) -> bool:
    cleaned = normalize_whitespace(value)

    if not cleaned or is_invalid_value(cleaned):
        return False

    normalized = normalize_label(cleaned)

    if normalized in ADDRESS_STOP_LABELS:
        return False

    address_keywords = (
        "street",
        "st.",
        "road",
        "rd.",
        "avenue",
        "ave",
        "lane",
        "nagar",
        "colony",
        "market",
        "park",
        "estate",
        "sector",
        "plot",
        "building",
        "floor",
        "city",
        "district",
        "state",
        "india",
        "kerala",
        "maharashtra",
        "gujarat",
        "delhi",
        "mumbai",
        "kochi",
    )

    lowered = cleaned.lower()

    return (
        any(keyword in lowered for keyword in address_keywords)
        or bool(re.search(r"\b\d{5,6}\b", cleaned))
    )


def find_two_column_party_data(lines: list[str]) -> dict:
    result = {
        "customer_name": None,
        "vendor_name": None,
        "customer_address": None,
    }

    for index, line in enumerate(lines):
        columns = split_columns(line)

        if len(columns) < 2:
            continue

        left_label = normalize_label(columns[0])
        right_label = normalize_label(columns[1])

        customer_on_left = (
            left_label in CUSTOMER_LABELS
            and right_label in VENDOR_LABELS
        )

        customer_on_right = (
            right_label in CUSTOMER_LABELS
            and left_label in VENDOR_LABELS
        )

        if not (customer_on_left or customer_on_right):
            continue

        if index + 1 < len(lines):
            name_columns = split_columns(lines[index + 1])

            if len(name_columns) >= 2:
                if customer_on_left:
                    result["customer_name"] = clean_entity_name(
                        name_columns[0]
                    )
                    result["vendor_name"] = clean_entity_name(
                        name_columns[1]
                    )
                else:
                    result["vendor_name"] = clean_entity_name(
                        name_columns[0]
                    )
                    result["customer_name"] = clean_entity_name(
                        name_columns[1]
                    )

        for following_line in lines[index + 2:index + 7]:
            address_columns = split_columns(following_line)

            if len(address_columns) < 2:
                continue

            candidate = (
                address_columns[0]
                if customer_on_left
                else address_columns[1]
            )

            if looks_like_address_line(candidate):
                result["customer_address"] = normalize_whitespace(candidate)
                break

        break

    return result


def value_after_label(
    lines: list[str],
    labels: set[str],
) -> Optional[str]:
    for index, line in enumerate(lines):
        columns = split_columns(line)

        for column_index, column in enumerate(columns):
            normalized_column = normalize_label(column)

            if normalized_column in labels:
                if column_index + 1 < len(columns):
                    candidate = columns[column_index + 1]

                    if not is_invalid_value(candidate):
                        return candidate

                for next_index in range(
                    index + 1,
                    min(index + 4, len(lines)),
                ):
                    next_columns = split_columns(lines[next_index])

                    if next_columns:
                        candidate = next_columns[0]

                        if not is_invalid_value(candidate):
                            return candidate

        for label in labels:
            pattern = rf"^\s*{re.escape(label)}\s*[:\-]\s*(.+)$"
            match = re.match(
                pattern,
                line,
                flags=re.IGNORECASE,
            )

            if match:
                candidate = normalize_whitespace(match.group(1))

                if not is_invalid_value(candidate):
                    return candidate

    return None


# ============================================================
# DATE EXTRACTION
# ============================================================

def normalize_date(value: Any) -> Optional[str]:
    cleaned = normalize_whitespace(value)

    if not cleaned:
        return None

    cleaned = re.sub(
        r"(?i)^(invoice\s*)?date\s*[:\-]?\s*",
        "",
        cleaned,
    ).strip()

    formats = (
        "%d-%b-%Y",
        "%d-%B-%Y",
        "%d/%m/%Y",
        "%d/%m/%y",
        "%d-%m-%Y",
        "%d-%m-%y",
        "%Y-%m-%d",
        "%d %B %Y",
        "%d %b %Y",
        "%B %d, %Y",
        "%b %d, %Y",
    )

    for date_format in formats:
        try:
            parsed = datetime.strptime(
                cleaned,
                date_format,
            )
            return parsed.strftime("%Y-%m-%d")

        except ValueError:
            continue

    return None


def extract_invoice_date(
    text: str,
    lines: list[str],
) -> Optional[str]:
    date_patterns = (
        rf"\b\d{{1,2}}[-/]\d{{1,2}}[-/]\d{{2,4}}\b",
        rf"\b\d{{1,2}}[-\s]{MONTH_PATTERN}[-\s]\d{{4}}\b",
        rf"\b{MONTH_PATTERN}\s+\d{{1,2}},\s*\d{{4}}\b",
        r"\b\d{4}-\d{1,2}-\d{1,2}\b",
    )

    for line in lines:
        columns = split_columns(line)

        for index, column in enumerate(columns):
            if normalize_label(column) not in {
                "invoice date",
                "date",
                "bill date",
            }:
                continue

            candidates = columns[index + 1:index + 3]

            for candidate in candidates:
                for pattern in date_patterns:
                    match = re.search(
                        pattern,
                        candidate,
                        flags=re.IGNORECASE,
                    )

                    if match:
                        parsed = normalize_date(match.group())

                        if parsed:
                            return parsed

        label_match = re.search(
            rf"(?i)\b(?:invoice\s+date|bill\s+date|date)"
            rf"\s*[:\-]?\s*("
            rf"\d{{1,2}}[-/]\d{{1,2}}[-/]\d{{2,4}}"
            rf"|\d{{1,2}}[-\s]{MONTH_PATTERN}[-\s]\d{{4}}"
            rf"|{MONTH_PATTERN}\s+\d{{1,2}},\s*\d{{4}}"
            rf"|\d{{4}}-\d{{1,2}}-\d{{1,2}}"
            rf")",
            line,
        )

        if label_match:
            parsed = normalize_date(label_match.group(1))

            if parsed:
                return parsed

    for pattern in date_patterns:
        for match in re.finditer(
            pattern,
            text,
            flags=re.IGNORECASE,
        ):
            parsed = normalize_date(match.group())

            if parsed:
                return parsed

    return None


# ============================================================
# VENDOR EXTRACTION
# ============================================================

def looks_like_vendor_name(value: Any) -> bool:
    cleaned = normalize_whitespace(value)

    if is_invalid_value(cleaned):
        return False

    normalized = normalize_label(cleaned)

    if normalized in CUSTOMER_LABELS:
        return False

    if any(
        phrase in normalized
        for phrase in (
            "invoice date",
            "invoice number",
            "invoice no",
            "customer detail",
            "bill to",
            "ship to",
            "period",
            "amount due",
        )
    ):
        return False

    alphabetic_count = sum(
        character.isalpha()
        for character in cleaned
    )
    numeric_count = sum(
        character.isdigit()
        for character in cleaned
    )

    if alphabetic_count < 2:
        return False

    if numeric_count > alphabetic_count * 2:
        return False

    if len(cleaned) > 100:
        return False

    if len(cleaned.split()) > 12:
        return False

    return True


def extract_vendor_name(
    text: str,
    lines: list[str],
) -> Optional[str]:
    two_column_data = find_two_column_party_data(lines)

    if looks_like_vendor_name(
        two_column_data.get("vendor_name")
    ):
        return two_column_data["vendor_name"]

    labelled_vendor = value_after_label(
        lines,
        VENDOR_LABELS,
    )

    if looks_like_vendor_name(labelled_vendor):
        return clean_entity_name(labelled_vendor)

    footer_patterns = (
        r"(?im)^\s*for\s+"
        r"([A-Za-z][A-Za-z0-9&.,'()\-\s]{2,80})"
        r"(?:\s*\|.*)?$",
        r"(?im)^\s*(?:seller|supplier|vendor)"
        r"\s*[:\-]\s*(.+)$",
    )

    for pattern in footer_patterns:
        matches = re.findall(pattern, text)

        for candidate in reversed(matches):
            candidate = clean_entity_name(candidate)

            if looks_like_vendor_name(candidate):
                return candidate

    for line in lines[:15]:
        columns = split_columns(line)
        candidate = clean_entity_name(
            columns[0] if columns else line
        )

        if looks_like_vendor_name(candidate):
            return candidate

    return None


# ============================================================
# INVOICE NUMBER
# ============================================================

def clean_invoice_number(value: Any) -> Optional[str]:
    cleaned = normalize_whitespace(value)

    if not cleaned:
        return None

    cleaned = cleaned.strip(" :#")

    if is_invalid_value(cleaned):
        return None

    if len(cleaned) > 50:
        return None

    if not re.search(r"[A-Za-z0-9]", cleaned):
        return None

    if cleaned.isalpha() and len(cleaned) < 4:
        return None

    return cleaned


def extract_invoice_number(
    text: str,
    lines: list[str],
) -> Optional[str]:
    labels = {
        "invoice no",
        "invoice number",
        "invoice #",
        "invoice id",
        "inv no",
        "inv number",
        "bill no",
        "bill number",
        "document no",
        "document number",
        "receipt no",
    }

    for line in lines:
        columns = split_columns(line)

        for index, column in enumerate(columns):
            if normalize_label(column) not in labels:
                continue

            if index + 1 < len(columns):
                candidate = clean_invoice_number(
                    columns[index + 1]
                )

                if candidate:
                    return candidate

    pattern = (
        r"(?i)\b(?:"
        + "|".join(re.escape(label) for label in labels)
        + r")\b\s*[:#\-]?\s*"
        r"([A-Z0-9][A-Z0-9./\-]{2,49})"
    )

    match = re.search(pattern, text)

    if match:
        number = clean_invoice_number(match.group(1))

        if number:
            return number

    fallback_patterns = (
        r"\bGST-\d{2,}(?:-\d{1,})+\b",
        r"\bINV[-/][A-Z0-9][A-Z0-9\-/]{2,}\b",
    )

    for fallback_pattern in fallback_patterns:
        fallback = re.search(
            fallback_pattern,
            text,
            flags=re.IGNORECASE,
        )

        if fallback:
            return fallback.group().strip()

    return None


# ============================================================
# CUSTOMER EXTRACTION
# ============================================================

def extract_customer_name(
    lines: list[str],
) -> Optional[str]:
    two_column_data = find_two_column_party_data(lines)

    if two_column_data.get("customer_name"):
        return two_column_data["customer_name"]

    for index, line in enumerate(lines):
        columns = split_columns(line)

        if not columns:
            continue

        if normalize_label(columns[0]) not in CUSTOMER_LABELS:
            continue

        if len(columns) >= 2:
            candidate = clean_entity_name(columns[1])

            if candidate and normalize_label(candidate) != "m/s":
                return candidate

        for next_line in lines[index + 1:index + 4]:
            next_columns = split_columns(next_line)

            if not next_columns:
                continue

            candidate = clean_entity_name(next_columns[0])

            if normalize_label(candidate) == "m/s":
                if len(next_columns) >= 2:
                    second_candidate = clean_entity_name(
                        next_columns[1]
                    )

                    if second_candidate:
                        return second_candidate

                continue

            if candidate:
                return candidate

    return None


def extract_customer_address(
    lines: list[str],
    customer_name: Optional[str],
) -> Optional[str]:
    two_column_data = find_two_column_party_data(lines)

    if two_column_data.get("customer_address"):
        return two_column_data["customer_address"]

    for index, line in enumerate(lines):
        columns = split_columns(line)

        if not columns:
            continue

        if normalize_label(columns[0]) != "address":
            continue

        address_parts = []

        if len(columns) >= 2:
            candidate = normalize_whitespace(columns[1])

            if candidate:
                address_parts.append(candidate)

        for following_line in lines[index + 1:index + 3]:
            following_columns = split_columns(following_line)

            if not following_columns:
                continue

            candidate = normalize_whitespace(
                following_columns[0]
            )

            if candidate and re.fullmatch(
                r"\d{5,6}",
                candidate,
            ):
                address_parts.append(candidate)
                break

        if address_parts:
            return normalize_whitespace(
                ", ".join(address_parts)
            )

    return None


def extract_customer_gstin(
    text: str,
    lines: list[str],
) -> Optional[str]:
    gstin_pattern = (
        r"\b\d{2}[A-Z]{5}\d{4}"
        r"[A-Z]\d[A-Z][A-Z0-9]\b"
    )

    valid_labels = {
        "gstin",
        "customer gstin",
        "buyer gstin",
        "gst no",
        "gst number",
    }

    for index, line in enumerate(lines):
        columns = split_columns(line)

        for column_index, column in enumerate(columns):
            if normalize_label(column) not in valid_labels:
                continue

            if column_index + 1 < len(columns):
                match = re.search(
                    gstin_pattern,
                    columns[column_index + 1],
                    flags=re.IGNORECASE,
                )

                if match:
                    return match.group().upper()

            for next_line in lines[index + 1:index + 3]:
                match = re.search(
                    gstin_pattern,
                    next_line,
                    flags=re.IGNORECASE,
                )

                if match:
                    return match.group().upper()

    return None


# ============================================================
# FINANCIAL EXTRACTION
# ============================================================

def find_labelled_amount(
    text: str,
    labels: tuple[str, ...],
) -> Optional[float]:
    label_pattern = "|".join(
        re.escape(label)
        for label in labels
    )

    relaxed_pattern = (
        rf"(?i)\b(?:{label_pattern})\b"
        rf"\s*[:\-]?\s*"
        rf"({AMOUNT_PATTERN})"
    )

    match = re.search(
        relaxed_pattern,
        text,
    )

    if match:
        return clean_amount(match.group(1))

    return None


def extract_subtotal(text: str) -> Optional[float]:
    return find_labelled_amount(
        text,
        (
            "subtotal",
            "sub total",
            "taxable value",
            "taxable amount",
            "amount before tax",
        ),
    )


def extract_discount(text: str) -> Optional[float]:
    return find_labelled_amount(
        text,
        (
            "discount",
            "less discount",
        ),
    )


def extract_tax_rate(text: str) -> Optional[float]:
    patterns = (
        r"(?i)\b(?:tax|gst|igst|cgst|sgst)"
        r"\s*\(?\s*(\d+(?:\.\d+)?)\s*%",
        r"(?i)\b(\d+(?:\.\d+)?)\s*%"
        r"\s*(?:tax|gst|igst|cgst|sgst)",
    )

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            return clean_percentage(match.group(1))

    return None


def extract_tax(text: str) -> Optional[float]:
    direct_tax = find_labelled_amount(
        text,
        (
            "tax amount",
            "total tax",
            "igst",
            "gst amount",
        ),
    )

    if direct_tax is not None:
        return direct_tax

    cgst = find_labelled_amount(text, ("cgst",))
    sgst = find_labelled_amount(text, ("sgst",))

    if cgst is not None and sgst is not None:
        return round(cgst + sgst, 2)

    return cgst if cgst is not None else sgst


def extract_total(text: str) -> Optional[float]:
    priority_labels = (
        ("grand total",),
        ("net amount",),
        ("net total",),
        ("amount due",),
        ("total payable",),
        ("invoice total",),
        ("balance due",),
        ("total amount",),
        ("total",),
    )

    for labels in priority_labels:
        amount = find_labelled_amount(
            text,
            labels,
        )

        if amount is not None:
            return amount

    return None


# ============================================================
# ITEM EXTRACTION
# ============================================================

def detect_item_table_start(
    lines: list[str],
) -> Optional[int]:
    header_keywords = (
        "description",
        "product",
        "service",
        "item",
        "particular",
        "qty",
        "quantity",
        "rate",
        "unit price",
        "amount",
        "taxable value",
        "hsn",
        "sac",
    )

    for index, line in enumerate(lines):
        normalized = line.lower()
        keyword_count = sum(
            keyword in normalized
            for keyword in header_keywords
        )

        if keyword_count >= 2:
            return index + 1

        if (
            "name of product" in normalized
            or "product/services" in normalized
        ):
            return index + 1

    return None


def parse_single_line_item(
    line: str,
) -> Optional[dict]:
    columns = split_columns(line)

    # Pipe-separated rows, for example:
    # Bosch Tool Kit | 8302 | 2,535.00
    if len(columns) >= 3:
        description = clean_entity_name(columns[0])
        final_amount = clean_amount(columns[-1])

        if description and final_amount is not None:
            return {
                "name": description,
                "quantity": None,
                "unit": None,
                "rate": None,
                "tax_rate": None,
                "taxable_value": final_amount,
            }

    patterns = (
        re.compile(
            rf"^(.+?)\s+"
            rf"(\d+(?:\.\d+)?)\s+"
            rf"({AMOUNT_PATTERN})\s+"
            rf"(\d+(?:\.\d+)?)%\s+"
            rf"({AMOUNT_PATTERN})$",
            flags=re.IGNORECASE,
        ),
        re.compile(
            rf"^(.+?)\s+"
            rf"(\d+(?:\.\d+)?)\s+"
            rf"({AMOUNT_PATTERN})\s+"
            rf"({AMOUNT_PATTERN})$",
            flags=re.IGNORECASE,
        ),
    )

    for pattern_index, pattern in enumerate(patterns):
        match = pattern.match(line)

        if not match:
            continue

        description = normalize_whitespace(match.group(1))

        if is_invalid_value(description):
            return None

        quantity = clean_amount(match.group(2))
        unit_price = clean_amount(match.group(3))

        if pattern_index == 0:
            tax_rate = clean_percentage(match.group(4))
            amount = clean_amount(match.group(5))
        else:
            tax_rate = None
            amount = clean_amount(match.group(4))

        if quantity is None or amount is None:
            return None

        return {
            "name": description,
            "quantity": quantity,
            "unit": "NOS",
            "rate": unit_price,
            "tax_rate": tax_rate,
            "taxable_value": amount,
        }

    return None


def parse_dated_item_line(
    line: str,
) -> Optional[dict]:
    """Parse header-less dated rows containing a rate and line amount."""
    normalized_line = normalize_whitespace(line)

    if not normalized_line:
        return None

    date_match = re.search(
        rf"\b{MONTH_PATTERN}\s+\d{{1,2}}\b",
        normalized_line,
        flags=re.IGNORECASE,
    )

    if not date_match:
        return None

    # Require currency-marked amounts or values with two decimal places.
    # This prevents dates and other integer values from being treated as money.
    money_pattern = (
        r"(?:₹|Rs\.?|INR|RM|\$|€|£)"
        r"\s*[\d,]+(?:\.\d{1,2})?"
        r"|"
        r"\b[\d,]+\.\d{2}\b"
    )

    amount_matches = list(
        re.finditer(
            money_pattern,
            normalized_line,
            flags=re.IGNORECASE,
        )
    )

    if len(amount_matches) < 2:
        return None

    description_text = normalized_line[:date_match.start()]
    description_text = re.sub(r"^[^A-Za-z]+", "", description_text)
    description_text = re.sub(r"\s+", " ", description_text)
    description = clean_entity_name(
        description_text.strip(" |-=—_:")
    )

    if not description:
        return None

    rate = clean_amount(amount_matches[-2].group())
    taxable_value = clean_amount(amount_matches[-1].group())

    if rate is None or taxable_value is None:
        return None

    return {
        "name": description,
        "quantity": None,
        "unit": None,
        "rate": rate,
        "tax_rate": None,
        "taxable_value": taxable_value,
    }


def extract_generic_items(
    lines: list[str],
) -> list[dict]:
    """Fallback item extraction when OCR misses the table header."""
    items = []

    for line in lines:
        item = parse_dated_item_line(line)

        if item:
            items.append(item)

    return items


def extract_items(
    lines: list[str],
) -> list[dict]:
    items = []
    item_start = detect_item_table_start(lines)

    if item_start is not None:
        for line in lines[item_start:]:
            normalized = line.lower().strip()

            if normalized.startswith(ITEM_STOP_PREFIXES):
                break

            item = parse_single_line_item(line)

            if item:
                items.append(item)

    if not items:
        items = extract_generic_items(lines)

    return items


# ============================================================
# MAIN EXTRACTION FUNCTION
# ============================================================

def extract_invoice_data(text: str) -> dict:
    invoice_data = {
        "vendor_name": None,
        "invoice_number": None,
        "invoice_date": None,
        "customer_name": None,
        "customer_address": None,
        "customer_gstin": None,
        "items": [],
        "subtotal": None,
        "discount": None,
        "tax_rate": None,
        "tax": None,
        "total": None,
    }

    if not isinstance(text, str) or not text.strip():
        return invoice_data

    lines = [
        normalized
        for line in text.splitlines()
        if (normalized := normalize_whitespace(line))
    ]

    if not lines:
        return invoice_data

    invoice_data["vendor_name"] = extract_vendor_name(
        text,
        lines,
    )

    invoice_data["invoice_number"] = extract_invoice_number(
        text,
        lines,
    )

    invoice_data["invoice_date"] = extract_invoice_date(
        text,
        lines,
    )

    invoice_data["customer_name"] = extract_customer_name(
        lines,
    )

    invoice_data["customer_address"] = extract_customer_address(
        lines,
        invoice_data["customer_name"],
    )

    invoice_data["customer_gstin"] = extract_customer_gstin(
        text,
        lines,
    )

    invoice_data["items"] = extract_items(
        lines,
    )

    invoice_data["subtotal"] = extract_subtotal(
        text,
    )

    invoice_data["discount"] = extract_discount(
        text,
    )

    invoice_data["tax_rate"] = extract_tax_rate(
        text,
    )

    invoice_data["tax"] = extract_tax(
        text,
    )

    invoice_data["total"] = extract_total(
        text,
    )

    if (
        invoice_data["subtotal"] is None
        and invoice_data["items"]
    ):
        item_amounts = [
            item.get("taxable_value")
            for item in invoice_data["items"]
            if isinstance(
                item.get("taxable_value"),
                (int, float),
            )
        ]

        if item_amounts:
            invoice_data["subtotal"] = round(
                sum(item_amounts),
                2,
            )

    if (
        invoice_data["tax"] is None
        and invoice_data["subtotal"] is not None
        and invoice_data["tax_rate"] is not None
    ):
        invoice_data["tax"] = round(
            invoice_data["subtotal"]
            * invoice_data["tax_rate"]
            / 100,
            2,
        )

    # Keep total as None unless an explicit total label was found.
    # A calculated subtotal is useful, but it should not be presented as the
    # invoice's final payable total when tax, discount, or other charges may be
    # missing from OCR.

    return invoice_data
