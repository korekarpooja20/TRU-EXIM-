require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Supabase connection
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "TRUVEX EXIM Backend is Running!"
    });
});

// Enquiry API
app.post("/api/enquiries", async (req, res) => {

    console.log("Enquiry request received");

    try {

        const {
            name,
            company,
            phone,
            email,
            service,
            requirement,
            message
        } = req.body;

        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and email are required."
            });
        }

        const { data, error } = await supabase
            .from("enquiries")
            .insert([
                {
                    name,
                    company,
                    phone,
                    email,
                    service,
                    requirement,
                    message,
                    status: "New"
                }
            ])
            .select();

        if (error) {
            console.error("SUPABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully!",
            data
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

app.listen(PORT, () => {
    console.log(`TRUVEX EXIM server running on port ${PORT}`);
});
app.use(cors());
app.use(express.json());
const path = require("path");

app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
