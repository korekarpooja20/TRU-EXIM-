import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

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

        if (error) {
            console.error("SUPABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save enquiry."
            });
        }

        // Send email using Resend
        const emailResult = await resend.emails.send({
            from: "TRUVEX EXIM <onboarding@resend.dev>",

            // येथे तुमचा email टाका
            to: ["korekarpooja20@gmail.com"],

            subject: "New Enquiry - TRUVEX EXIM",

            html: `
                <h2>New Enquiry Received</h2>

                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Requirement:</strong> ${requirement}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        });

        console.log("SUPABASE SUCCESS:", data);
        console.log("RESEND RESULT:", emailResult);

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
