// =========================================================
// TRUVEX EXIM - SERVER.JS
// Express Backend + Static Website + Supabase + Email
// =========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();


// =========================================================
// PORT
// =========================================================

const PORT = process.env.PORT || 5000;


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());


// =========================================================
// STATIC WEBSITE FILES
// =========================================================

app.use(express.static(__dirname));

app.use(
    "/images",
    express.static(path.join(__dirname, "images"))
);


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


        // =================================================
        // VALIDATION
        // =================================================

        if (!name || !phone || !email) {

            return res.status(400).json({
                success: false,
                message: "Name, phone and email are required."
            });

        }


        // =================================================
        // SAVE ENQUIRY TO SUPABASE
        // =================================================

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


        // =================================================
        // SUPABASE ERROR
        // =================================================

        if (error) {

            console.error("Supabase error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });

        }


        // =================================================
        // EMAIL NOTIFICATION
        // =================================================

        try {

            const emailResponse = await fetch(
                "https://api.resend.com/emails",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
                    },

                    body: JSON.stringify({

                        from: "TRUVEX EXIM <onboarding@resend.dev>",

                        to: [process.env.RESEND_TO_EMAIL],

                        subject: `New Enquiry - ${name}`,

                        text: `
NEW TRUVEX EXIM ENQUIRY

Hello TRUVEX,

I am interested in your products/services.

Name: ${name}
Company/Business: ${company || "Not provided"}
Phone: ${phone}
Email: ${email}
Requirement: ${requirement || "Not provided"}
Product/Service: ${service || "Not provided"}
Quantity/Budget: Not provided
Location: Not provided

Message:
${message || "Not provided"}

Please share the details, pricing and further information.

Thank you.

------------------------------------------------
TRUVEX EXIM
Connecting Markets. Building Businesses. Delivering Solutions.
------------------------------------------------
                        `

                    })
                }
            );


            const emailResult = await emailResponse.json();


            if (!emailResponse.ok) {

                console.error(
                    "Resend email error:",
                    emailResult
                );

            } else {

                console.log(
                    "Email notification sent:",
                    emailResult
                );

            }

        }

        catch (emailError) {

            console.error(
                "Email notification failed:",
                emailError
            );

        }


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Enquiry submitted successfully!",

            data: data

        });

    }

    catch (error) {

        console.error(
            "Server error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

});


// =========================================================
// HTML PAGE ROUTES
// =========================================================

app.get("/index.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
    );
});


app.get("/contact.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "contact.html")
    );
});


app.get("/about.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "about.html")
    );
});


app.get("/consultation.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "consultation.html")
    );
});


app.get("/import-export.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "import-export.html")
    );
});


app.get("/products.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "products.html")
    );
});


app.get("/services.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "services.html")
    );
});


// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {

    res.status(404).send(
        "Page Not Found"
    );

});


// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {

    console.log(
        `TRUVEX EXIM server running on port ${PORT}`
    );

});
