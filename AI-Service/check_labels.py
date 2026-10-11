import json
from collections import Counter


# Processed dataset load karna
with open(
    "processed_data.json",
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


# Labels count karna
label_counter = Counter()


# Har sample ke labels read karna
for sample in data:

    label_counter.update(
        sample["labels"]
    )


# Label distribution print karna
print("\nLABEL DISTRIBUTION\n")

for label, count in sorted(
    label_counter.items()
):

    print(
        f"{label}: {count}"
    )


# Total samples
print(
    "\nTotal Samples:",
    len(data)
)