import json
import torch

from pathlib import Path
from torch.utils.data import Dataset

from transformers import (
    LayoutLMTokenizer,
    LayoutLMForTokenClassification,
    Trainer,
    TrainingArguments
)


# ============================================================
# 1. PROJECT PATHS
# ============================================================

# Current AI-Service folder
BASE_DIR = Path(__file__).parent

# Preprocessed dataset file
DATA_PATH = BASE_DIR / "processed_data.json"


# ============================================================
# 2. LABEL DEFINITIONS
# ============================================================

# All labels used by our invoice extraction model
LABELS = [

    "O",

    "B-COMPANY",
    "I-COMPANY",

    "B-DATE",
    "I-DATE",

    "B-ADDRESS",
    "I-ADDRESS",

    "B-TOTAL",
    "I-TOTAL"
]


# Convert label names into numbers
#
# Example:
#
# O          -> 0
# B-COMPANY  -> 1
# I-COMPANY  -> 2

LABEL2ID = {
    label: index
    for index, label in enumerate(LABELS)
}


# Convert numbers back into labels
ID2LABEL = {
    index: label
    for label, index in LABEL2ID.items()
}


# ============================================================
# 3. LOAD PROCESSED DATA
# ============================================================

print(
    "Loading processed dataset..."
)


with open(
    DATA_PATH,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


print(
    f"Total samples: {len(data)}"
)


# ============================================================
# 4. LOAD LAYOUTLM TOKENIZER
# ============================================================

print(
    "Loading LayoutLM tokenizer..."
)


tokenizer = LayoutLMTokenizer.from_pretrained(
    "microsoft/layoutlm-base-uncased"
)


# ============================================================
# 5. NORMALIZE BOUNDING BOXES
# ============================================================

def normalize_box(
    box,
    max_width=500,
    max_height=1000
):
    """
    LayoutLM bounding boxes ko
    0-1000 range mein expect karta hai.

    Original format:

    [x_min, y_min, x_max, y_max]

    Example:

    [50, 82, 440, 121]

    Normalized format:

    [100, 82, 880, 121]
    """

    x_min, y_min, x_max, y_max = box


    # X coordinates ko 0-1000 range mein convert karna

    x_min = int(
        x_min / max_width * 1000
    )

    x_max = int(
        x_max / max_width * 1000
    )


    # Y coordinates ko 0-1000 range mein convert karna

    y_min = int(
        y_min / max_height * 1000
    )

    y_max = int(
        y_max / max_height * 1000
    )


    # Values ko 0-1000 range mein restrict karna

    x_min = max(
        0,
        min(1000, x_min)
    )

    y_min = max(
        0,
        min(1000, y_min)
    )

    x_max = max(
        0,
        min(1000, x_max)
    )

    y_max = max(
        0,
        min(1000, y_max)
    )


    return [
        x_min,
        y_min,
        x_max,
        y_max
    ]


# ============================================================
# 6. CUSTOM DATASET CLASS
# ============================================================

class InvoiceDataset(Dataset):


    def __init__(
        self,
        data
    ):

        # Complete processed dataset store karna
        self.data = data


    def __len__(
        self
    ):

        # Dataset mein total samples
        return len(
            self.data
        )


    def __getitem__(
        self,
        index
    ):

        # Current invoice sample
        sample = self.data[index]


        # OCR words
        words = sample[
            "words"
        ]


        # Original bounding boxes
        original_boxes = sample[
            "boxes"
        ]


        # Word-level labels
        word_labels = sample[
            "labels"
        ]


        # ----------------------------------------------------
        # NORMALIZE BOUNDING BOXES
        # ----------------------------------------------------

        boxes = [

            normalize_box(
                box
            )

            for box in original_boxes

        ]


        # ----------------------------------------------------
        # LABEL NAMES → LABEL IDS
        # ----------------------------------------------------

        label_ids = [

            LABEL2ID[
                label
            ]

            for label in word_labels

        ]


        # ----------------------------------------------------
        # TOKENIZE OCR WORDS
        # ----------------------------------------------------

        encoding = tokenizer(

            words,

            boxes=boxes,

            padding="max_length",

            truncation=True,

            max_length=512,

            is_split_into_words=True

        )


        # ----------------------------------------------------
        # GET WORD IDS
        # ----------------------------------------------------

        """
        LayoutLM tokenizer words ko
        multiple subword tokens mein divide
        kar sakta hai.

        Example:

        "BOOKTAK"

        becomes:

        BOOK
        ##TA
        ##K

        word_ids batata hai ki
        har token kis original word
        se belong karta hai.
        """

        word_ids = encoding.word_ids()


        # Token-level labels
        labels = []


        # Previous word track karna
        previous_word_id = None


        # Har token ke liye label create karna
        for word_id in word_ids:


            # Special tokens:
            #
            # [CLS]
            # [SEP]
            # [PAD]

            if word_id is None:

                labels.append(
                    -100
                )


            # First token of a word

            elif word_id != previous_word_id:

                labels.append(

                    label_ids[
                        word_id
                    ]

                )


            # Same word ke remaining subword tokens

            else:

                labels.append(
                    -100
                )


            # Current word ko previous word banana

            previous_word_id = word_id


        # ----------------------------------------------------
        # CONVERT ENCODING TO PYTORCH TENSORS
        # ----------------------------------------------------

        encoding = {

            key: torch.tensor(
                value
            )

            for key, value in encoding.items()

        }


        # Labels model input mein add karna

        encoding[
            "labels"
        ] = torch.tensor(

            labels,

            dtype=torch.long

        )


        return encoding


# ============================================================
# 7. CREATE DATASET
# ============================================================

dataset = InvoiceDataset(
    data
)


print(
    "Dataset created successfully!"
)


# ============================================================
# 8. LOAD PRETRAINED LAYOUTLM
# ============================================================

print(
    "Loading LayoutLM model..."
)


model = LayoutLMForTokenClassification.from_pretrained(

    "microsoft/layoutlm-base-uncased",

    num_labels=len(
        LABELS
    ),

    id2label=ID2LABEL,

    label2id=LABEL2ID

)


# ============================================================
# 9. TRAINING CONFIGURATION
# ============================================================

training_args = TrainingArguments(

    # Model output folder
    output_dir="./invoice_model",

    # Number of complete passes
    # through the training dataset
    num_train_epochs=3,

    # Number of invoices processed at once
    per_device_train_batch_size=2,

    # Save model after every epoch
    save_strategy="epoch",

    # Print training logs
    logging_steps=10,

    # Learning rate
    learning_rate=5e-5,

    # Disable external reporting
    report_to="none"

)


# ============================================================
# 10. CREATE TRAINER
# ============================================================

trainer = Trainer(

    # LayoutLM model
    model=model,

    # Training settings
    args=training_args,

    # Training dataset
    train_dataset=dataset

)


# ============================================================
# 11. START TRAINING
# ============================================================

print(
    "\nStarting model training...\n"
)


trainer.train()


# ============================================================
# 12. SAVE TRAINED MODEL
# ============================================================

trainer.save_model(

    "./invoice_model"

)


# Save tokenizer
tokenizer.save_pretrained(

    "./invoice_model"

)


print(
    "\nTraining completed!"
)


print(
    "Model saved in ./invoice_model"
)