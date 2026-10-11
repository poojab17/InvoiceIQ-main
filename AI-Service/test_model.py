import json
import torch

from pathlib import Path

from transformers import (
    LayoutLMTokenizer,
    LayoutLMForTokenClassification
)


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = Path(__file__).parent

MODEL_DIR = BASE_DIR / "invoice_model"

DATA_PATH = BASE_DIR / "processed_data.json"


# ============================================================
# 2. LOAD TRAINED MODEL
# ============================================================

print("Loading trained model...")

tokenizer = LayoutLMTokenizer.from_pretrained(
    MODEL_DIR
)

model = LayoutLMForTokenClassification.from_pretrained(
    MODEL_DIR
)

model.eval()

print("Model loaded successfully!")


# ============================================================
# 3. LOAD LABEL MAPPING
# ============================================================

id2label = model.config.id2label


# ============================================================
# 4. LOAD TEST SAMPLE
# ============================================================

with open(
    DATA_PATH,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


sample = data[0]

words = sample["words"]

boxes = sample["boxes"]


# ============================================================
# 5. NORMALIZE BOUNDING BOXES
# ============================================================

# LayoutLM expects coordinates between 0 and 1000.
# Our dataset coordinates are already based on the invoice image.
# We scale them into LayoutLM's expected coordinate range.

def normalize_box(box):

    x0, y0, x1, y1 = box

    return [

        max(0, min(1000, int(x0))),

        max(0, min(1000, int(y0))),

        max(0, min(1000, int(x1))),

        max(0, min(1000, int(y1)))

    ]


normalized_boxes = [

    normalize_box(box)

    for box in boxes

]


# ============================================================
# 6. TOKENIZE WORDS
# ============================================================

encoding = tokenizer(

    words,

    padding="max_length",

    truncation=True,

    max_length=512,

    is_split_into_words=True,

    return_tensors="pt"

)


# ============================================================
# 7. CREATE BOUNDING BOXES FOR TOKENS
# ============================================================

# The tokenizer splits words into sub-tokens.
# Therefore, every token needs a bounding box.
# We use the original word's bounding box for its sub-tokens.

word_ids = encoding.word_ids(
    batch_index=0
)


token_boxes = []


for word_id in word_ids:

    if word_id is None:

        # Special tokens such as [CLS] and [SEP]
        # receive a zero bounding box.

        token_boxes.append(
            [0, 0, 0, 0]
        )

    else:

        token_boxes.append(
            normalized_boxes[word_id]
        )


# Convert bounding boxes into tensor

bbox = torch.tensor(

    [token_boxes],

    dtype=torch.long

)


# ============================================================
# 8. MODEL PREDICTION
# ============================================================

with torch.no_grad():

    outputs = model(

        input_ids=encoding["input_ids"],

        attention_mask=encoding["attention_mask"],

        bbox=bbox

    )


# ============================================================
# 9. GET PREDICTIONS
# ============================================================

predictions = outputs.logits.argmax(
    dim=-1
)[0]


# ============================================================
# 10. DISPLAY WORD + PREDICTED LABEL
# ============================================================

print("\nMODEL PREDICTIONS\n")

previous_word_id = None


for token_index, word_id in enumerate(
    word_ids
):

    # Ignore special tokens

    if word_id is None:

        continue


    # Avoid printing the same word multiple times
    # when tokenizer creates multiple sub-tokens.

    if word_id == previous_word_id:

        continue


    label_id = predictions[
        token_index
    ].item()


    label = id2label[
        label_id
    ]


    print(

        f"{words[word_id]:<45}"

        f"{label}"

    )


    previous_word_id = word_id


    # ============================================================
# 11. EXTRACT STRUCTURED ENTITIES
# ============================================================

entities = {
    "company": [],
    "address": [],
    "date": [],
    "total": []
}


current_entity = None


for token_index, word_id in enumerate(word_ids):

    # Ignore special tokens
    if word_id is None:
        continue


    # Avoid duplicate sub-tokens
    if word_id == previous_word_id:
        continue


    word = words[word_id]

    label_id = predictions[token_index].item()

    label = id2label[label_id]


    # --------------------------------------------------------
    # B-ENTITY
    # --------------------------------------------------------

    if label.startswith("B-"):

        entity_type = label[2:].lower()

        if entity_type in entities:

            current_entity = entity_type

            entities[entity_type].append(word)

        else:

            current_entity = None


    # --------------------------------------------------------
    # I-ENTITY
    # --------------------------------------------------------

    elif label.startswith("I-"):

        entity_type = label[2:].lower()

        if (

            entity_type in entities

            and current_entity == entity_type

        ):

            entities[entity_type].append(word)


    # --------------------------------------------------------
    # O
    # --------------------------------------------------------

    else:

        current_entity = None


    previous_word_id = word_id


# ============================================================
# 12. CONVERT LISTS INTO STRINGS
# ============================================================

invoice_data = {

    "company": " ".join(
        entities["company"]
    ),

    "address": " ".join(
        entities["address"]
    ),

    "date": " ".join(
        entities["date"]
    ),

    "total": " ".join(
        entities["total"]
    )

}


# ============================================================
# 13. DISPLAY STRUCTURED JSON
# ============================================================

print("\n\nSTRUCTURED INVOICE DATA\n")

print(

    json.dumps(

        invoice_data,

        indent=4,

        ensure_ascii=False

    )

)