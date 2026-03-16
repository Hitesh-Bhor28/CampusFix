const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --------------- Middleware ---------------
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// --------------- Routes ---------------
app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, message: "CampusFix API is running" });
});

app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));

// --------------- Error Handling ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
