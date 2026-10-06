const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());

// =========================================================
// STATIC WEBSITE
// =========================================================

app.use(express.static(path.join(__dirname, "..")));

// =========================================================
// HOME PAGE
// =========================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});

// =========================================================
// BACKEND TEST
// =========================================================

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "TRUVEX EXIM Backend is Running!"
    });
});

// =========================================================
// EXPORT
// =========================================================

module.exports = app;