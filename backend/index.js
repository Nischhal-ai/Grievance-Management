const dns=require("dns").promises;
dns.setServers(['8.8.8.8','1.1.1.1']);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= Middleware ================= */
app.use(express.json());
app.use(cors({ origin: "*" }));

/* ================= MongoDB ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= Student Schema ================= */
const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  course: String
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

/* ================= Grievance Schema ================= */
const grievanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  title: { type: String, required: true },
  description: { type: String, required: true },

  category: {
    type: String,
    enum: ["Academic", "Hostel", "Transport", "Other"],
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending"
  }

}, { timestamps: true }); // gives createdAt

const Grievance = mongoose.model("Grievance", grievanceSchema);

/* ================= Auth Middleware ================= */
const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= Router ================= */
const router = express.Router();

/* 🔹 Register */
router.post("/register", async (req, res) => {
  const { name, email, password, course } = req.body;

  if (!name || !email || !password || !course) {
    return res.status(400).json({ message: "All fields required" });
  }

  const existing = await Student.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  await new Student({ name, email, password: hash, course }).save();

  res.status(201).json({ message: "Registered successfully" });
});

/* 🔹 Login */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Student.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({ token });
});

/* 🔹 Dashboard */
router.get("/dashboard", authMiddleware, async (req, res) => {
  const student = await Student.findById(req.user.id).select("-password");
  res.json({ student });
});

/* 🔹 Create Grievance */
router.post("/grievances", authMiddleware, async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: "All fields required" });
  }

  const grievance = await new Grievance({
    studentId: req.user.id,
    title,
    description,
    category
  }).save();

  res.status(201).json(grievance);
});

/* 🔹 Get All Grievances */
router.get("/grievances", authMiddleware, async (req, res) => {
  const grievances = await Grievance.find({
    studentId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(grievances);
});

/* 🔹 Get by ID */
router.get("/grievances/:id", authMiddleware, async (req, res) => {
  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(grievance);
});

/* 🔹 Update */
router.put("/grievances/:id", authMiddleware, async (req, res) => {
  const updated = await Grievance.findOneAndUpdate(
    { _id: req.params.id, studentId: req.user.id },
    req.body,
    { new: true }
  );

  res.json(updated);
});

/* 🔹 Delete */
router.delete("/grievances/:id", authMiddleware, async (req, res) => {
  await Grievance.findOneAndDelete({
    _id: req.params.id,
    studentId: req.user.id
  });

  res.json({ message: "Deleted successfully" });
});

/* 🔹 Search */
router.get("/grievances/search", authMiddleware, async (req, res) => {
  const { title } = req.query;

  const results = await Grievance.find({
    studentId: req.user.id,
    title: { $regex: title, $options: "i" }
  });

  res.json(results);
});

/* ================= Use Router ================= */
app.use("/api", router);

/* ================= Error Middleware ================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

/* ================= Server ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});