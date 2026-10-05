const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "TRUVEX EXIM Backend is Running!"
    });

});


// ===============================
// ENQUIRY API
// ===============================

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


        // Validation
        if (!name || !phone || !email) {

            return res.status(400).json({
                success: false,
                message: "Name, phone and email are required."
            });

        }


        // ===============================
        // SAVE TO SUPABASE
        // ===============================

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


        if (error) {

            console.error("Supabase error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });

        }


        // ===============================
        // SEND EMAIL USING RESEND
        // ===============================

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

                        from: "TRUVEX EXIM <onboarding@resend.dev>",

                        to: [process.env.RESEND_TO_EMAIL],

                        subject: `New TRUVEX EXIM Enquiry - ${name}`,

                        text: `
🔔 NEW TRUVEX EXIM ENQUIRY

Hello TRUVEX,

I am interested in your products/services.

Name: ${name}

Company/Business: ${company || "Not provided"}

Phone: ${phone}

Email: ${email}

Product/Service: ${service || "Not provided"}

Requirement: ${requirement || "Not provided"}

Message:
${message || "Not provided"}

Please share the details, pricing and further information.

Thank you.
                        `
                    })
                }
            );


            const emailResult = await emailResponse.json();

            console.log("Resend response:", emailResult);


        } catch (emailError) {

            console.error(
                "Email notification error:",
                emailError
            );

        }


        // ===============================
        // FINAL SUCCESS
        // ===============================

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


module.exports = app;
