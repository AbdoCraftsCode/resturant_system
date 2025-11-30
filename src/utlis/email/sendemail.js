import SibApiV3Sdk from "sib-api-v3-sdk";

export const sendemail = async ({
    to = [],
    subject = "",
    text = "",
    html = "",
} = {}) => {
    try {
        let defaultClient = SibApiV3Sdk.ApiClient.instance;
        let apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

        let sendSmtpEmail = {
            sender: { email: process.env.SENDER_EMAIL, name: "Fedk 👻" },
            to: recipients,
            subject: subject || "No Subject",
            textContent: text?.trim() || "This is an automated email.",
            htmlContent: html || `<p>${text || "No Content"}</p>`,
        };

        let data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("✅ Email sent via API:", data);
        return data;

    } catch (error) {
        console.error("❌ Email send error:", error.response?.text || error.message || error);
        throw error;
    }
};
