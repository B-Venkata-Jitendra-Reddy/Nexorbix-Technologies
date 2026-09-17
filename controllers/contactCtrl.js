const Contact = require("../models/contact");

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

    // ----------------------------------------------------
    // SAVE CONTACT ENQUIRY TO MONGODB
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

    // ----------------------------------------------------
    // REDIRECT USER TO SUCCESS PAGE
    // ----------------------------------------------------

    return res.redirect("/success");

  } catch (error) {
    console.error("❌ Contact Error:", error);

    return res.status(500).send("Server Error");
  }
};