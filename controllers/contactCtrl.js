const Contact = require("../models/contact");
const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Escape user input before putting it into HTML emails
const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// POST /contact
exports.submitContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message
    } = req.body;

    // Validate form fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).send("All fields are required");
    }

    // Clean values
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    // Escape values for HTML emails
    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safePhone = escapeHtml(cleanPhone);
    const safeSubject = escapeHtml(cleanSubject);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, "<br>");

    // ----------------------------------------------------
    // 1. SAVE CONTACT ENQUIRY TO MONGODB
    // ----------------------------------------------------

    const newContact = new Contact({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage
    });

    await newContact.save();

    console.log("✅ Contact Saved");


    return res.redirect("/success");

  } catch (error) {

    console.error("❌ Contact Error:", error);

    return res.status(500).send("Server Error");
  }
};