const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./db");

const casesRouter = require("./routes/cases");
const evidenceRouter = require("./routes/evidence");
const analysisRouter = require("./routes/analysis");
const dashboardRouter = require("./routes/dashboard");
const timelineRouter = require("./routes/timeline");
const chatRouter = require("./routes/chat");
const reportsRouter = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Dev auth middleware — injects a default actor on every request
app.use("/api", (req, res, next) => {
  req.actor = {
    id: "dev-investigator",
    role: "INVESTIGATOR",
    email: "investigator@crimevision.local",
    displayName: "Alex Morgan"
  };
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "crimevision-ai", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/cases", casesRouter);
app.use("/api/v1/evidence", evidenceRouter);
app.use("/api/v1/analysis", analysisRouter);
app.use("/api/v1/analysis/timeline", timelineRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/reports", reportsRouter);

// Fallback — serve index.html for SPA-like routing
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred."
    }
  });
});

// Ensure storage directories exist
const fs = require("fs");
const storageRoot = path.join(__dirname, "storage");
fs.mkdirSync(path.join(storageRoot, "staging"), { recursive: true });
fs.mkdirSync(path.join(storageRoot, "raw"), { recursive: true });

app.listen(PORT, () => {
  console.log(`🔍 CrimeVision AI running at http://localhost:${PORT}`);
});
