import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import os
import sys
import json

# ---------------------------
# 1. Load trained model
# ---------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Dynamically get class names from 'train' folder
train_dir = "train"
class_names = sorted(os.listdir(train_dir))

num_classes = len(class_names)
model = models.resnet18(weights="IMAGENET1K_V1")
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Load weights (✅ correct absolute path)
model.load_state_dict(torch.load(
    r"C:\Users\Shreya\Desktop\CV\food_req\ml\ml\saved_model\food_resnet18.pth",
    map_location=device
))
model = model.to(device)
model.eval()

# ---------------------------
# 2. Preprocessing (same as training)
# ---------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ---------------------------
# 3. Prediction function
# ---------------------------
def predict(image_path, class_names, calorie_db):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    image = Image.open(image_path).convert("RGB")
    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        conf, predicted = torch.max(probs, 1)

    label = class_names[predicted.item()]
    confidence = conf.item() * 100
    calories_per_100g = calorie_db.get(label, "N/A")

    return label, confidence, calories_per_100g

# ---------------------------
# 4. Command-line support
# ---------------------------
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python predict.py <image_path> <calorie_db.json>")
        sys.exit(1)

    image_path = sys.argv[1]
    calorie_db_path = sys.argv[2]

    # Load calorie DB
    with open(calorie_db_path, "r") as f:
        calorie_db = json.load(f)

    label, conf, cal = predict(image_path, class_names, calorie_db)
    print(f"Predicted: {label} ({conf:.2f}% confidence)")
    print(f"Calories per 100g: {cal}")
