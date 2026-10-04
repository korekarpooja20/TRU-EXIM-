const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {
    enquiryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(enquiryForm);

        const enquiryData = {
            name: formData.get("name"),
            company: formData.get("company"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            service: formData.get("service"),
            requirement: formData.get("requirement"),
            message: formData.get("message")
        };

        try {
            const response = await fetch("http://localhost:5000/api/enquiries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(enquiryData)
            });

            const result = await response.json();

            if (result.success) {
                alert("Thank you! Your enquiry has been submitted successfully.");
                enquiryForm.reset();
            } else {
                alert(result.message || "Failed to submit enquiry.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("Unable to connect to the server.");
        }
    });
}