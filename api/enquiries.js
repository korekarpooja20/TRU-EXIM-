const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

    // =====================================================
    // ONLY POST REQUEST ALLOWED
    // =====================================================

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {

        // =================================================
        // GET FORM DATA
        // =================================================

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
                    company: company || null,
                    phone: phone,
                    email: email,
                    service: service || null,
                    requirement: requirement || null,
                    message: message || null,
                    status: "New"
                }
            ])
            .select();


        // =================================================
        // SUPABASE ERROR
        // =================================================

        if (error) {

            console.error("SUPABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry.",
                error: error.message
            });

        }


        // =================================================
        // SEND EMAIL USING RESEND
        // =================================================

        let emailStatus = "not_sent";

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
                            `NEW TRUVEX EXIM ENQUIRY - ${name}`,

                        text: `
NEW TRUVEX EXIM ENQUIRY

Hello TRUVEX,

I am interested in your products/services.

Name:
${name}

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


            if (emailResponse.ok) {

                emailStatus = "sent";

                console.log(
                    "RESEND SUCCESS:",
                    emailResult
                );

            } else {

                console.error(
                    "RESEND ERROR:",
                    emailResult
                );

            }

        } catch (emailError) {

            console.error(
                "EMAIL ERROR:",
                emailError
            );

        }


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Thank you for contacting TRUVEX EXIM. We will get back to you soon.",

            emailStatus: emailStatus,

            data: data

        });

    }

    // =====================================================
    // SERVER ERROR
    // =====================================================

    catch (error) {

        console.error(
            "SERVER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error."

        });

    }
}