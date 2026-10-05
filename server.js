require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());


// =========================================================
// PORT
// =========================================================

const PORT = process.env.PORT || 5000;


// =========================================================
// SERVE FRONTEND FILES
// =========================================================

app.use(express.static(__dirname));


// =========================================================
// SUPABASE CONNECTION
// =========================================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


// =========================================================
// HOME PAGE
// =========================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// =========================================================
// BACKEND TEST
// =========================================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "TRUVEX EXIM Backend is Running!"
    });
});


// =========================================================
// ENQUIRY API
// =========================================================

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


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!name || !phone || !email) {

            return res.status(400).json({
                success: false,
                message: "Name, phone and email are required."
            });

        }


        // -------------------------------------------------
        // SAVE TO SUPABASE
        // -------------------------------------------------

        const { data, error } = await supabase
            .from("enquiries")
            .insert([
                {
                    name: name,
                    company: company,
                    phone: phone,
                    email: email,
                    service: service,
                    requirement: requirement,
                    message: message,
                    status: "New"
                }
            ])
            .select();


        // -------------------------------------------------
        // SUPABASE ERROR
        // -------------------------------------------------

        if (error) {

            console.error("Supabase error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });

        }


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully!",
            data: data
        });

    }

    catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error."
        });

    }

});


// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {

    res.status(404).send("Page Not Found");

});


// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {

    console.log(
        `TRUVEX EXIM server running on port ${PORT}`
    );

});
