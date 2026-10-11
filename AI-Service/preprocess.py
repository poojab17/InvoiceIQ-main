import json
import re
from pathlib import Path


# ============================================================
# DATASET PATHS
# ============================================================

# Current project folder:
# C:/Users/shaur/Desktop/InvoiceIQ/AI-Service
BASE_DIR = Path(__file__).parent

# Main SROIE dataset folder
DATASET_DIR = BASE_DIR / "dataset" / "SROIE2019"

# OCR text + bounding box files
TRAIN_BOX_DIR = DATASET_DIR / "train" / "box"

# Ground-truth entity files
TRAIN_ENTITY_DIR = DATASET_DIR / "train" / "entities"


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text):
    """
    OCR text aur entity text ko comparable banata hai.

    Example:
    "25/12/2018" -> "25122018"
    "DATE:"       -> "DATE"

    Isse punctuation aur uppercase/lowercase
    differences handle ho jaate hain.
    """

    # Sab text ko uppercase mein convert karna
    text = text.upper()

    # Special characters aur punctuation remove karna
    text = re.sub(r"[^A-Z0-9]", "", text)

    return text


# ============================================================
# BOX FILE READ KARNA
# ============================================================

def read_box_file(box_path):
    """
    Box file ka format:

    x1,y1,x2,y2,x3,y3,x4,y4,TEXT

    Example:

    165,372,342,372,342,389,165,389,25/12/2018

    Isse hum nikalte hain:

    Word:
    25/12/2018

    Bounding Box:
    [165, 372, 342, 389]
    """

    # OCR words store karne ke liye
    words = []

    # Bounding boxes store karne ke liye
    boxes = []

    # File open karna
    with open(box_path, "r", encoding="utf-8") as file:

        # Har line process karna
        for line in file:

            # Extra spaces aur newline remove karna
            line = line.strip()

            # Empty line skip karna
            if not line:
                continue

            # Comma ke basis par line split karna
            parts = line.split(",")

            # Minimum 8 coordinates + text hona chahiye
            if len(parts) < 9:
                continue

            # First 8 values coordinates hain
            coordinates = list(
                map(int, parts[:8])
            )

            # Baaki text hai
            word = ",".join(
                parts[8:]
            ).strip()

            # X coordinates:
            # x1, x2, x3, x4
            x_coordinates = coordinates[0::2]

            # Y coordinates:
            # y1, y2, y3, y4
            y_coordinates = coordinates[1::2]

            # Simple rectangular bounding box create karna
            x_min = min(x_coordinates)
            y_min = min(y_coordinates)
            x_max = max(x_coordinates)
            y_max = max(y_coordinates)

            # Word store karna
            words.append(word)

            # Bounding box store karna
            boxes.append([
                x_min,
                y_min,
                x_max,
                y_max
            ])

    return words, boxes


# ============================================================
# ENTITY FILE READ KARNA
# ============================================================

def read_entity_file(entity_path):
    """
    Entity file JSON format mein hoti hai:

    {
        "company": "...",
        "date": "...",
        "address": "...",
        "total": "..."
    }

    Ye hamare ground-truth labels hain.
    """

    with open(
        entity_path,
        "r",
        encoding="utf-8"
    ) as file:

        # JSON ko Python dictionary mein convert karna
        return json.load(file)


# ============================================================
# ENTITY KE WORDS FIND KARNA
# ============================================================

def find_entity_words(words, entity_value):
    """
    Example:

    Entity:
    date = "25/12/2018"

    OCR words:
    ["DATE:", "25/12/2018", "CASHIER:"]

    Result:
    "25/12/2018" -> DATE
    """

    # Entity text ko words mein split karna
    entity_words = entity_value.split()

    # Entity words normalize karna
    normalized_entity_words = [
        normalize_text(word)
        for word in entity_words
    ]

    # Matching OCR word indexes
    matched_indexes = []

    # Har OCR word check karna
    for index, word in enumerate(words):

        # OCR word normalize karna
        normalized_word = normalize_text(word)

        # Agar OCR word entity ke words mein hai
        if normalized_word in normalized_entity_words:

            matched_indexes.append(index)

    return matched_indexes


# ============================================================
# ML LABELS CREATE KARNA
# ============================================================

def create_labels(words, entities):
    """
    BIO labeling:

    B = Beginning
    I = Inside
    O = Outside

    Example:

    COMPANY NAME STORE

    B-COMPANY
    I-COMPANY
    I-COMPANY

    Jo word kisi entity ka part nahi hai:

    O
    """

    # Initially sabhi words ko O label
    labels = [
        "O"
        for _ in words
    ]

    # Dataset entity names ko ML labels se map karna
    entity_mapping = {

        "company": "COMPANY",

        "date": "DATE",

        "address": "ADDRESS",

        "total": "TOTAL"
    }

    # Har entity process karna
    for entity_name, entity_label in entity_mapping.items():

        # Entity value lena
        entity_value = entities.get(
            entity_name,
            ""
        )

        # Agar entity missing hai
        if not entity_value:
            continue

        # OCR words mein matching words find karna
        matched_indexes = find_entity_words(
            words,
            entity_value
        )

        # Matching words ko labels dena
        for position, index in enumerate(
            matched_indexes
        ):

            # Entity ka first word
            if position == 0:

                labels[index] = (
                    f"B-{entity_label}"
                )

            # Entity ke remaining words
            else:

                labels[index] = (
                    f"I-{entity_label}"
                )

    return labels


# ============================================================
# COMPLETE DATASET PROCESS KARNA
# ============================================================

def process_dataset():

    """
    Har receipt ke liye:

    BOX FILE
        +
    ENTITY FILE
        ↓
    ML TRAINING SAMPLE
    """

    # Processed samples store karna
    processed_data = []

    # Train box folder se saari files lena
    box_files = list(
        TRAIN_BOX_DIR.glob("*.txt")
    )

    print(
        f"Found {len(box_files)} "
        "training samples"
    )

    # Har box file process karna
    for box_file in box_files:

        # File name se ID lena
        #
        # X00016469612.txt
        # becomes
        # X00016469612

        file_id = box_file.stem

        # Matching entity file ka path
        entity_file = (
            TRAIN_ENTITY_DIR
            / f"{file_id}.txt"
        )

        # Entity file missing ho toh skip
        if not entity_file.exists():
            continue

        # OCR words aur boxes read karna
        words, boxes = read_box_file(
            box_file
        )

        # Ground-truth entities read karna
        entities = read_entity_file(
            entity_file
        )

        # Har word ko ML label dena
        labels = create_labels(
            words,
            entities
        )

        # Complete processed sample
        sample = {

            "id": file_id,

            "words": words,

            "boxes": boxes,

            "labels": labels,

            "entities": entities
        }

        # Dataset mein add karna
        processed_data.append(
            sample
        )

    # Output file path
    output_path = (
        BASE_DIR
        / "processed_data.json"
    )

    # Processed data save karna
    with open(
        output_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            processed_data,
            file,
            indent=2,
            ensure_ascii=False
        )

    print(
        "Preprocessing completed!"
    )

    print(
        f"Processed samples: "
        f"{len(processed_data)}"
    )

    print(
        f"Saved to: {output_path}"
    )


# ============================================================
# PROGRAM START
# ============================================================

# Ye function tabhi chalega jab hum run karenge:
#
# python preprocess.py

if __name__ == "__main__":

    process_dataset()