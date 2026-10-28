import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import os
import sys
import json

# Ensure stdout only prints clean JSON
sys.stdout.reconfigure(encoding='utf-8')

# ---------------------------
# 1. Config & Paths
# ---------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

classifier_path = r"C:\Users\Shreya\Desktop\CV\food_req\ml\ml\saved_model\food_resnet18.pth"
regressor_path = r"C:\Users\Shreya\Desktop\CV\food_req\ml\ml\saved_model\portion_regressor.pth"
calorie_db_path = r"C:\Users\Shreya\Desktop\CV\food_req\ml\calorie_db.json"
train_dir = r"C:\Users\Shreya\Desktop\CV\food_req\ml\train"

# ---------------------------
# 2. Class Names
# ---------------------------
class_names = sorted(os.listdir(train_dir))

# ---------------------------
# 3. Preprocessing
# ---------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ---------------------------
# 4. Load Models
# ---------------------------
classifier = models.resnet18(weights="IMAGENET1K_V1")
classifier.fc = nn.Linear(classifier.fc.in_features, len(class_names))
classifier.load_state_dict(torch.load(classifier_path, map_location=device))
classifier = classifier.to(device)
classifier.eval()

regressor = models.resnet18(weights="IMAGENET1K_V1")
regressor.fc = nn.Linear(regressor.fc.in_features, 1)
regressor.load_state_dict(torch.load(regressor_path, map_location=device))
regressor = regressor.to(device)
regressor.eval()

# ---------------------------
# 5. Load Calorie + Nutrient DB
# ---------------------------
with open(calorie_db_path, "r") as f:
    calorie_db = json.load(f)


# ---------------------------
# 6. Prediction Functions
# ---------------------------
def predict_food(image_path):
    image = Image.open(image_path).convert("RGB")
    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = classifier(img_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        conf, predicted = torch.max(probs, 1)

    return class_names[predicted.item()], float(conf.item() * 100)


def predict_portion(image_path):
    image = Image.open(image_path).convert("RGB")
    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        grams = regressor(img_tensor)
    return float(grams.item())


def estimate_nutrients(food, grams):
    info = calorie_db[food]

    return {
        "calories": float(grams * info["kcal"] / 100),
        "carbohydrates": float(grams * info["carbohydrates"] / 100),
        "protein": float(grams * info["protein"] / 100),
        "fat": float(grams * info["fat"] / 100)
    }


# ---------------------------
# 7. Main Script (Output ONLY JSON)
# ---------------------------
if __name__ == "__main__":
    image_path = sys.argv[1]

    food_label, conf = predict_food(image_path)
    grams = predict_portion(image_path)
    nutrients = estimate_nutrients(food_label, grams)

    result = {
        "food": food_label,
        "confidence": conf,
        "portion_g": grams,
        "calories": nutrients["calories"],
        "carbohydrates": nutrients["carbohydrates"],
        "protein": nutrients["protein"],
        "fat": nutrients["fat"]
    }

    print(json.dumps(result))
