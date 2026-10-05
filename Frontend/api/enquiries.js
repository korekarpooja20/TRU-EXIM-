import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

    // Only POST requests are allowed
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

        // Save enquiry in Supabase
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
                    message: message
                }
            ])
            .select();

        // Supabase error
        if (error) {

            console.error("SUPABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });
        }

        console.log("SUPABASE SUCCESS:", data);

        return res.status(200).json({
            success: true,
            message: "Enquiry submitted successfully."
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
}