import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ---------------------------
// 1. MongoDB Connection
// ---------------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/foodRecognition", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------------------
// USER SCHEMA (Signup/Login)
// ---------------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  phone: String,
});

const User = mongoose.model("User", userSchema);

// ---------------------------
// ⭐ REQUIRED FIX: FoodPrediction MODEL
// ---------------------------
const foodPredictionSchema = new mongoose.Schema({
  food: String,
  confidence: Number,
  portion_g: Number,
  calories: Number,
  carbohydrates: Number,
  protein: Number,
  fat: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const FoodPrediction = mongoose.model("FoodPrediction", foodPredictionSchema);

// ---------------------------
// AUTH ROUTES (Signup / Login)
// ---------------------------

// ➤ SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, age, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPass,
      age,
      phone,
    });

    await user.save();

    res.json({ success: true, message: "Signup successful" });
  } catch (error) {
    res.json({ success: false, message: "Signup failed" });
  }
});

// ➤ LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    res.json({ success: false, message: "Login failed" });
  }
});

// ---------------------------
// 4. Prediction Route (WITH ONLY FIX ADDED)
// ---------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/api/predict", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const scriptPath = path.join("ml", "predict_calories.py");

    const py = spawn("python", [scriptPath, imagePath]);
    let data = "";

    py.stdout.on("data", (chunk) => (data += chunk.toString()));
    py.stderr.on("data", (err) =>
      console.error("🐍 Python Error:", err.toString())
    );

    py.on("close", async () => {
      try {
        // ⭐ ONLY REQUIRED FIX
        const cleaned = data.toString().trim().replace(/\n/g, "");
        const result = JSON.parse(cleaned);

        const newPrediction = new FoodPrediction({
          food: result.food,
          confidence: result.confidence,
          portion_g: result.portion_g,
          calories: result.calories,
          carbohydrates: result.carbohydrates,
          protein: result.protein,
          fat: result.fat,
          imageUrl: `/uploads/${req.file.filename}`,
        });

        await newPrediction.save();
        res.json({ success: true, data: newPrediction });
      } catch (error) {
        console.error("❌ JSON Parse Error:", error);
        res.status(500).json({ success: false, message: "Prediction failed" });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ---------------------------
// 5. Start Server
// ---------------------------
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
