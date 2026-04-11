import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import setupRoutes from "./Router.js";
import errorHandler from "./src/middleware/errorHandler.middlware.js";

// Loads environment variables from `.env` into process.env
dotenv.config();

// Connect to MongoDB at startup (fails fast if it cannot connect).
connectDB();

const app = express();

// Enable CORS so a browser-based frontend can call this API.
// Note: `origin` should match your frontend URL
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Parse incoming JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Agrians");
});

// Set up API routes
setupRoutes(app);

// Global error handling middleware
app.use(errorHandler);

//404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Get the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
