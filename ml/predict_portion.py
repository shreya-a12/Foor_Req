import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import sys
import os

# ---------------------------
# 1. Config
# ---------------------------
save_path = r"C:\Users\Shreya\Desktop\CV\food_req\ml\ml\saved_model\portion_regressor.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------------------
# 2. Transform (same as training)
# ---------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ---------------------------
# 3. Load Model
# ---------------------------
model = models.resnet18(weights="IMAGENET1K_V1")
model.fc = nn.Linear(model.fc.in_features, 1)  # regression output
model.load_state_dict(torch.load(save_path, map_location=device))
model = model.to(device)
model.eval()

# ---------------------------
# 4. Prediction Function
# ---------------------------
def predict_portion(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = Image.open(image_path).convert("RGB")
    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        grams = output.item()  # predicted portion in grams

    return grams

# ---------------------------
# 5. CLI Support
# ---------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict_portion.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    grams = predict_portion(image_path)
    print(f"Estimated Portion: {grams:.2f} g")
