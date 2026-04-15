const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite local
      "https://expense-tracker-frontend-tau-nine.vercel.app",
    ],
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
