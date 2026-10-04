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
app.get("/", (req, res) => {
    res.send("TRUVEX EXIM Backend is Running!");
});

// Enquiry API
app.post("/api/enquiries", async (req, res) => {
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
            console.error("Supabase error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });
        }

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully!",
            data: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

app.listen(PORT, () => {
    console.log(`TRUVEX EXIM server running on port ${PORT}`);
});
<script src="script.js"></script>

