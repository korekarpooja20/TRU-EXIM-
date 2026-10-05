const path = require("path");
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());


// =========================================================
// STATIC FILES
// =========================================================

app.use(express.static(path.join(__dirname, "..")));


// =========================================================
// SUPABASE
// =========================================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


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
// ENQUIRY API
// =========================================================

app.post("/enquiries", async (req, res) => {

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
        // SAVE TO SUPABASE
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

            console.error(
                "Supabase error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });

        }


        // =================================================
        // SEND EMAIL NOTIFICATION
        // =================================================

        try {

            const emailResponse = await fetch(
                "https://api.resend.com/emails",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            `Bearer ${process.env.RESEND_API_KEY}`
                    },

                    body: JSON.stringify({

                        from:
                            "TRUVEX EXIM <onboarding@resend.dev>",

                        to: [
                            process.env.RESEND_TO_EMAIL
                        ],

                        subject:
                            `New TRUVEX EXIM Enquiry - ${name}`,

                        text: `
NEW TRUVEX EXIM ENQUIRY

Hello TRUVEX,

I am interested in your products/services.

Name: ${name}

Company/Business:
${company || "Not provided"}

Phone:
${phone}

Email:
${email}

Requirement:
${requirement || "Not provided"}

Product/Service:
${service || "Not provided"}

Message:
${message || "Not provided"}

Please share the details, pricing and further information.

Thank you.

----------------------------------------
TRUVEX EXIM
Connecting Markets. Building Businesses. Delivering Solutions.
----------------------------------------
                        `
                    })
                }
            );


            const emailResult =
                await emailResponse.json();


            if (!emailResponse.ok) {

                console.error(
                    "Resend error:",
                    emailResult
                );

            } else {

                console.log(
                    "Email sent successfully:",
                    emailResult
                );

            }

        }

        catch (emailError) {

            console.error(
                "Email sending error:",
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
// EXPORT
// =========================================================

module.exports = app;
