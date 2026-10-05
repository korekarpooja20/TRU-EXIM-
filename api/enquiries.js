const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

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

        // Save enquiry to Supabase
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

        // Send email notification
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

            console.log("Resend response:", emailResult);

        } catch (emailError) {

            console.error(
                "Email error:",
                emailError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully!",
            data
        });

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
}
