
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const Device = mongoose.model("Device", new mongoose.Schema({
  maThietBi: { type: String, required: true, unique: true },
  tenThietBi: { type: String, required: true },
  loaiThietBi: String,
  phongHoc: String,
  tinhTrang: String
}, { timestamps: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1
      ? "connected" : "disconnected"
  });
});

app.get("/api/devices", async (req, res) => {
  try {
    res.json(await Device.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/devices", async (req, res) => {
  try {
    res.status(201).json(await Device.create(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/devices/:id", async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    );
    if (!device) return res.status(404).json({ error: "Not found" });
    res.json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/devices/:id", async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Backend running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
