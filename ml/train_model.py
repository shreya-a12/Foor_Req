import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

# ---------------------------
# 1. Dataset paths
# ---------------------------
train_dir = "train"
val_dir   = "valid"

# ---------------------------
# 2. Preprocessing pipeline
# ---------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # resize images
    transforms.ToTensor(),          # convert to tensor
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])  # normalize for ResNet
])

train_dataset = datasets.ImageFolder(train_dir, transform=transform)
val_dataset   = datasets.ImageFolder(val_dir, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
val_loader   = DataLoader(val_dataset, batch_size=8)

# ---------------------------
# 3. Model (Transfer Learning – ResNet18)
# ---------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.resnet18(pretrained=True)
for param in model.parameters():
    param.requires_grad = False   # freeze all layers

# replace last layer for 10 food classes
num_classes = len(train_dataset.classes)  # should be 10
model.fc = nn.Linear(model.fc.in_features, num_classes)
model = model.to(device)

# ---------------------------
# 4. Training setup
# ---------------------------
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=0.001)

# ---------------------------
# 5. Training loop
# ---------------------------
EPOCHS = 3
for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    print(f"Epoch [{epoch+1}/{EPOCHS}], Loss: {running_loss/len(train_loader):.4f}")

# ---------------------------
# 6. Save trained model
# ---------------------------
os.makedirs("ml/saved_model", exist_ok=True)
torch.save(model.state_dict(), "ml/saved_model/food_resnet18.pth")

print("✅ Training complete! Model saved at ml/saved_model/food_resnet18.pth")
