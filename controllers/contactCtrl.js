const Contact = require("../models/contact");
const nodemailer = require("nodemailer");

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).send("All fields are required");
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      message
    });

    await newContact.save();

    console.log("✅ Contact Saved");
    // console.log("New Contact Saved:", newContact);

    // ==========================
    // ✉️ EMAIL LOGIC START HERE
    // ==========================
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 📩 Mail to YOU
      const adminMail = {
        from: `"Nexorbix Website" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "📩 New Contact Form Submission - Nexorbix Technologies",
        html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#005555; color:#ffffff; padding:20px; text-align:center;">
        <h2 style="margin:0;">🚀 Nexorbix Technologies</h2>
        <p style="margin:0; font-size:14px;">New Client Inquiry</p>
      </div>

      <!-- Body -->
      <div style="padding:20px;">
        <h3 style="color:#333;">Contact Details</h3>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <div style="margin-top:15px;">
          <p><strong>Message:</strong></p>
          <div style="background:#f1f1f1; padding:15px; border-radius:8px;">
            ${message}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#777;">
        Nexorbix Technologies © ${new Date().getFullYear()}
      </div>

    </div>
  </div>
  `,
      };

      // 📩 Mail to CLIENT
      const clientMail = {
        from: `"Nexorbix Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🚀 Thank You for Contacting Nexorbix Technologies",
        html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:#005555; color:#ffffff; padding:20px; text-align:center;">
        <h2 style="margin:0;">🚀 Nexorbix Technologies</h2>
        <p style="margin:0;">We’ve received your message</p>
      </div>

      <!-- Body -->
      <div style="padding:20px; color:#333;">
        <h3>Hello ${name},</h3>

        <p>Thank you for reaching out to <strong>Nexorbix Technologies</strong>.</p>
        <p>Our team will get back to you shortly.</p>

        <div style="margin-top:20px; padding:15px; background:#f9f9f9; border-radius:8px;">
          <h4>Your Submitted Details:</h4>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
        </div>

        <div style="margin-top:15px;">
          <p><strong>Your Message:</strong></p>
          <div style="background:#f1f1f1; padding:15px; border-radius:8px;">
            ${message}
          </div>
        </div>

        <p style="margin-top:20px;">
          Best regards,<br/>
          <strong>Nexorbix Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Nexorbix Technologies<br/>
        Building Next-Gen Digital Solutions 🌐
      </div>

    </div>
  </div>
  `,
      };

      // Send emails
      await transporter.sendMail(adminMail);
      await transporter.sendMail(clientMail);

      console.log("📧 Emails sent");

    } catch (emailError) {
      console.error("❌ Email failed:", emailError.message);
      // DON'T crash app
    }

    // ==========================
    // ✉️ EMAIL LOGIC END
    // ==========================

    res.redirect("/success");

  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).send("Server Error");
  }
};