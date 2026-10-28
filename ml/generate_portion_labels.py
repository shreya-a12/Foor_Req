import os
import csv

portion_weights = {
    "apple_pie": 150,
    "bibimbap": 350,
    "cannoli": 80,
    "edamame": 100,
    "falafel": 120,
    "french_toast": 200,
    "ice_cream": 90,
    "ramen": 400,
    "sushi": 180,
    "tiramisu": 140
}
train_dir = "train"  
output_csv = "portion_labels.csv"

# ----------------------------
# 3. Generate CSV
# ----------------------------
rows = []
for food_class, weight in portion_weights.items():
    class_dir = os.path.join(train_dir, food_class)
    if not os.path.exists(class_dir):
        print(f"⚠️ Warning: {class_dir} not found, skipping...")
        continue

    for img_file in os.listdir(class_dir):
        if img_file.lower().endswith((".jpg", ".jpeg", ".png")):
            img_path = os.path.join(class_dir, img_file)
            rows.append([img_path, weight])

# Save to CSV
with open(output_csv, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["image_path", "weight"])
    writer.writerows(rows)

print(f"✅ portion_labels.csv created with {len(rows)} entries.")
