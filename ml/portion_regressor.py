import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, models
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import os
import pandas as pd

# ---------------------------
# 1. Config
# ---------------------------
csv_file = "portion_labels.csv"   # CSV file with image_path,weight
save_path = r"C:\Users\Shreya\Desktop\CV\food_req\ml\ml\saved_model\portion_regressor.pth"
batch_size = 16
num_epochs = 5
lr = 0.001

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------------------
# 2. Custom Dataset
# ---------------------------
class PortionDataset(Dataset):
    def __init__(self, csv_file, transform=None):
        self.labels = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        img_path = self.labels.iloc[idx, 0]   # already has "train/..."
        image = Image.open(img_path).convert("RGB")
        portion = torch.tensor(float(self.labels.iloc[idx, 1]), dtype=torch.float32)

        if self.transform:
            image = self.transform(image)

        return image, portion

# ---------------------------
# 3. Transform
# ---------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ---------------------------
# 4. Dataset + Dataloader
# ---------------------------
dataset = PortionDataset(csv_file, transform=transform)
train_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# ---------------------------
# 5. Model (ResNet18 with regression head)
# ---------------------------
model = models.resnet18(weights="IMAGENET1K_V1")
model.fc = nn.Linear(model.fc.in_features, 1)  # regression → grams
model = model.to(device)

# ---------------------------
# 6. Loss + Optimizer
# ---------------------------
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=lr)

# ---------------------------
# 7. Training Loop
# ---------------------------
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0

    for images, portions in train_loader:
        images, portions = images.to(device), portions.to(device).unsqueeze(1)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, portions)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(train_loader):.4f}")

# ---------------------------
# 8. Save Model
# ---------------------------
os.makedirs(os.path.dirname(save_path), exist_ok=True)
torch.save(model.state_dict(), save_path)
print(f"✅ Portion regressor saved at {save_path}")
