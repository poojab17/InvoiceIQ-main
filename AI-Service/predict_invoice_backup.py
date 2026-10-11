import json
import torch
import torch.nn.functional as F
import pytesseract

from pathlib import Path
from PIL import Image

from transformers import (
    LayoutLMTokenizer,
    LayoutLMForTokenClassification
)


# ============================================================
# 1. TESSERACT PATH
# ============================================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ============================================================
# 2. PATHS
# ============================================================

BASE_DIR = Path(__file__).parent

MODEL_DIR = BASE_DIR / "invoice_model"


# ============================================================
# 3. LOAD MODEL ONCE
# ============================================================

print("Loading trained model...")

tokenizer = LayoutLMTokenizer.from_pretrained(
    MODEL_DIR
)

model = LayoutLMForTokenClassification.from_pretrained(
    MODEL_DIR
)

model.eval()

id2label = model.config.id2label

print("Model loaded successfully!")


# ============================================================
# 4. PREDICTION FUNCTION
# ============================================================

def predict_invoice(image_path):

    # --------------------------------------------------------
    # LOAD IMAGE
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


    # --------------------------------------------------------
    # OCR
    # --------------------------------------------------------

    ocr_data = pytesseract.image_to_data(

        image,

        output_type=pytesseract.Output.DICT

    )


    words = []

    boxes = []


    image_width, image_height = image.size


    for i in range(

        len(ocr_data["text"])

    ):

        text = ocr_data["text"][i].strip()


        if text == "":

            continue


        x = ocr_data["left"][i]

        y = ocr_data["top"][i]

        width = ocr_data["width"][i]

        height = ocr_data["height"][i]


        words.append(text)


        boxes.append(

            [

                x,

                y,

                x + width,

                y + height

            ]

        )


    print(

        f"OCR extracted {len(words)} words"

    )


    # --------------------------------------------------------
    # NORMALIZE BOUNDING BOXES
    # --------------------------------------------------------

    def normalize_box(box):

        x0, y0, x1, y1 = box


        return [

            max(

                0,

                min(

                    1000,

                    int(

                        1000 * x0 / image_width

                    )

                )

            ),

            max(

                0,

                min(

                    1000,

                    int(

                        1000 * y0 / image_height

                    )

                )

            ),

            max(

                0,

                min(

                    1000,

                    int(

                        1000 * x1 / image_width

                    )

                )

            ),

            max(

                0,

                min(

                    1000,

                    int(

                        1000 * y1 / image_height

                    )

                )

            )

        ]


    normalized_boxes = [

        normalize_box(box)

        for box in boxes

    ]


    # --------------------------------------------------------
    # TOKENIZE
    # --------------------------------------------------------

    encoding = tokenizer(

        words,

        padding="max_length",

        truncation=True,

        max_length=512,

        is_split_into_words=True,

        return_tensors="pt"

    )


    word_ids = encoding.word_ids(

        batch_index=0

    )


    # --------------------------------------------------------
    # TOKEN BOXES
    # --------------------------------------------------------

    token_boxes = []


    for word_id in word_ids:

        if word_id is None:

            token_boxes.append(

                [0, 0, 0, 0]

            )

        else:

            token_boxes.append(

                normalized_boxes[word_id]

            )


    bbox = torch.tensor(

        [token_boxes],

        dtype=torch.long

    )


    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    with torch.no_grad():

        outputs = model(

            input_ids=encoding["input_ids"],

            attention_mask=encoding["attention_mask"],

            bbox=bbox

        )


    # --------------------------------------------------------
    # PROBABILITIES + CONFIDENCE
    # --------------------------------------------------------

    probabilities = F.softmax(

        outputs.logits,

        dim=-1

    )


    predictions = probabilities.argmax(

        dim=-1

    )[0]


    confidence_scores = probabilities.max(

        dim=-1

    ).values[0]


    # --------------------------------------------------------
    # ENTITY EXTRACTION
    # --------------------------------------------------------

    entities = {

        "company": [],

        "address": [],

        "date": [],

        "total": []

    }


    entity_confidences = {

        "company": [],

        "address": [],

        "date": [],

        "total": []

    }


    current_entity = None

    previous_word_id = None


    for token_index, word_id in enumerate(word_ids):


        if word_id is None:

            continue


        if word_id == previous_word_id:

            continue


        word = words[word_id]


        label_id = predictions[

            token_index

        ].item()


        label = id2label[label_id]


        confidence = confidence_scores[

            token_index

        ].item()


        print(

            f"{word:<45}"

            f"{label:<15}"

            f"Confidence: "

            f"{confidence:.2f}"

        )


        if label.startswith("B-"):


            entity_type = label[2:].lower()


            if entity_type in entities:


                current_entity = entity_type


                entities[entity_type].append(

                    word

                )


                entity_confidences[

                    entity_type

                ].append(

                    confidence

                )


            else:

                current_entity = None


        elif label.startswith("I-"):


            entity_type = label[2:].lower()


            if (

                entity_type in entities

                and current_entity == entity_type

            ):


                entities[entity_type].append(

                    word

                )


                entity_confidences[

                    entity_type

                ].append(

                    confidence

                )


        else:

            current_entity = None


        previous_word_id = word_id


    # ========================================================
    # CONFIDENCE CALCULATION
    # ========================================================

    def get_entity_confidence(entity_type):


        scores = entity_confidences[

            entity_type

        ]


        if not scores:

            return 0.0


        return round(

            sum(scores)

            /

            len(scores),

            4

        )


    # ========================================================
    # FINAL STRUCTURED DATA
    # ========================================================

    invoice_data = {


        "company": {


            "value": " ".join(

                entities["company"]

            ),


            "confidence": get_entity_confidence(

                "company"

            )

        },


        "address": {


            "value": " ".join(

                entities["address"]

            ),


            "confidence": get_entity_confidence(

                "address"

            )

        },


        "date": {


            "value": " ".join(

                entities["date"]

            ),


            "confidence": get_entity_confidence(

                "date"

            )

        },


        "total": {


            "value": " ".join(

                entities["total"]

            ),


            "confidence": get_entity_confidence(

                "total"

            )

        }

    }


    # ========================================================
    # OVERALL AI CONFIDENCE
    # ========================================================

    field_confidences = [

        invoice_data["company"]["confidence"],

        invoice_data["address"]["confidence"],

        invoice_data["date"]["confidence"],

        invoice_data["total"]["confidence"]

    ]


    valid_confidences = [

        score

        for score in field_confidences

        if score > 0

    ]


    if valid_confidences:


        invoice_data[

            "overall_confidence"

        ] = round(

            sum(valid_confidences)

            /

            len(valid_confidences),

            4

        )


    else:


        invoice_data[

            "overall_confidence"

        ] = 0.0


    return invoice_data


# ============================================================
# 5. LOCAL TEST
# ============================================================

if __name__ == "__main__":


    image_path = BASE_DIR / "test_invoice.jpg"


    result = predict_invoice(

        image_path

    )


    print(

        "\nSTRUCTURED INVOICE DATA\n"

    )


    print(

        json.dumps(

            result,

            indent=4

        )

    )

