import pytesseract

from PIL import Image


# ==================================================
# TESSERACT PATH
# ==================================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ==================================================
# IMAGE PATH
# ==================================================

IMAGE_PATH = "test_invoice.jpg"


# ==================================================
# OPEN IMAGE
# ==================================================

image = Image.open(IMAGE_PATH)

print("IMAGE OPENED SUCCESSFULLY")

print("IMAGE SIZE:", image.size)


# ==================================================
# OCR
# ==================================================

text = pytesseract.image_to_string(image)


# ==================================================
# PRINT RESULT
# ==================================================

print("\n========== OCR OUTPUT ==========\n")

print(text)

print("\n========== END ==========\n")