const Contact = require("../models/contact");
const { Resend } = require("resend");

// ----------------------------------------------------
// RESEND
// ----------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

// ----------------------------------------------------
// NEXORBIX EMAIL CONFIGURATION
// ----------------------------------------------------

const ADMIN_EMAIL = "contact.nexorbix@gmail.com";

const FROM_EMAIL =
  "NexOrbiX Technologies <contact@nexorbix.co.in>";

// Public HTTPS URL of your NexOrbiX logo
// Example:
// https://yourdomain.com/images/nexorbix-logo.png
const LOGO_URL = process.env.NEXORBIX_LOGO_URL;

// Website URL
const WEBSITE_URL = "https://nexorbix.co.in";

// ----------------------------------------------------
// ESCAPE HTML
// ----------------------------------------------------

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ----------------------------------------------------
// LOGO HTML
// ----------------------------------------------------

const getLogoHtml = () => {
  if (!LOGO_URL) {
    return `
      <div style="
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #008077;
        margin-bottom: 6px;
      ">
        NexOrbiX
      </div>

      <div style="
        font-size: 12px;
        color: #6b7280;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      ">
        Technologies
      </div>
    `;
  }

  return `
    <img
      src="${escapeHtml(LOGO_URL)}"
      alt="NexOrbiX Technologies"
      width="180"
      style="
        display: block;
        width: 180px;
        max-width: 100%;
        height: auto;
        border: 0;
        margin: 0 auto;
      "
    />
  `;
};

// ----------------------------------------------------
// EMAIL BASE STYLES
// ----------------------------------------------------

const emailWrapperStart = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>NexOrbiX Technologies</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f3f7f6;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    background-color: #f3f7f6;
    padding: 30px 15px;
  "
>

<tr>
<td align="center">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width: 680px;
    background-color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  "
>

<!-- TOP BRAND BAR -->

<tr>
<td style="
  height: 6px;
  background-color: #008077;
  font-size: 0;
  line-height: 0;
">
  &nbsp;
</td>
</tr>

<!-- LOGO -->

<tr>
<td align="center" style="
  padding: 30px 30px 20px;
">
  ${getLogoHtml()}
</td>
</tr>
`;

const emailFooter = `
<!-- FOOTER -->

<tr>
<td style="
  padding: 25px 30px;
  background-color: #f8faf9;
  border-top: 1px solid #e5e7eb;
  text-align: center;
">

  <p style="
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 700;
    color: #008077;
  ">
    NexOrbiX Technologies
  </p>

  <p style="
    margin: 0 0 10px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.6;
  ">
    Building technology for what comes next.
  </p>

  <p style="
    margin: 0;
    font-size: 12px;
  ">
    <a
      href="${WEBSITE_URL}"
      target="_blank"
      style="
        color: #008077;
        text-decoration: none;
        font-weight: 600;
      "
    >
      nexorbix.co.in
    </a>
  </p>

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
`;

// ----------------------------------------------------
// POST /contact
// ----------------------------------------------------

exports.submitContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message
    } = req.body;

    // ----------------------------------------------------
    // VALIDATE
    // ----------------------------------------------------

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).send("All fields are required");
    }

    // ----------------------------------------------------
    // CLEAN VALUES
    // ----------------------------------------------------

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    // ----------------------------------------------------
    // SAVE TO MONGODB
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
    // CHECK RESEND
    // ----------------------------------------------------

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing");

      return res.redirect("/success");
    }

    // ====================================================
    // EMAIL 1
    // ADMIN NOTIFICATION
    // ====================================================

    const adminEmailResult = await resend.emails.send({

      from: FROM_EMAIL,

      to: [ADMIN_EMAIL],

      replyTo: cleanEmail,

      subject: `New Enquiry: ${cleanSubject}`,

      html: `

        ${emailWrapperStart}

        <!-- ADMIN HEADER -->

        <tr>
        <td style="
          padding: 10px 40px 25px;
        ">

          <div style="
            display: inline-block;
            padding: 7px 12px;
            background-color: #e6f5f3;
            color: #008077;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          ">
            New Website Enquiry
          </div>

          <h1 style="
            margin: 16px 0 8px;
            font-size: 28px;
            line-height: 1.25;
            color: #111827;
          ">
            You have a new enquiry
          </h1>

          <p style="
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
            color: #6b7280;
          ">
            Someone has submitted the contact form on the
            NexOrbiX website.
          </p>

        </td>
        </tr>

        <!-- CONTACT DETAILS -->

        <tr>
        <td style="
          padding: 0 40px 25px;
        ">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
            "
          >

            <!-- NAME -->

            <tr>
              <td style="
                padding: 15px 18px;
                width: 35%;
                background-color: #f8faf9;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
                color: #6b7280;
                font-weight: 600;
              ">
                Name
              </td>

              <td style="
                padding: 15px 18px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
                color: #111827;
                font-weight: 600;
              ">
                ${escapeHtml(cleanName)}
              </td>
            </tr>

            <!-- EMAIL -->

            <tr>
              <td style="
                padding: 15px 18px;
                background-color: #f8faf9;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
                color: #6b7280;
                font-weight: 600;
              ">
                Email
              </td>

              <td style="
                padding: 15px 18px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
              ">
                <a
                  href="mailto:${escapeHtml(cleanEmail)}"
                  style="
                    color: #008077;
                    text-decoration: none;
                  "
                >
                  ${escapeHtml(cleanEmail)}
                </a>
              </td>
            </tr>

            <!-- PHONE -->

            <tr>
              <td style="
                padding: 15px 18px;
                background-color: #f8faf9;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
                color: #6b7280;
                font-weight: 600;
              ">
                Phone
              </td>

              <td style="
                padding: 15px 18px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
                color: #111827;
              ">
                ${escapeHtml(cleanPhone)}
              </td>
            </tr>

            <!-- SUBJECT -->

            <tr>
              <td style="
                padding: 15px 18px;
                background-color: #f8faf9;
                font-size: 13px;
                color: #6b7280;
                font-weight: 600;
              ">
                Subject
              </td>

              <td style="
                padding: 15px 18px;
                font-size: 14px;
                color: #111827;
                font-weight: 600;
              ">
                ${escapeHtml(cleanSubject)}
              </td>
            </tr>

          </table>

        </td>
        </tr>

        <!-- MESSAGE -->

        <tr>
        <td style="
          padding: 0 40px 30px;
        ">

          <h3 style="
            margin: 0 0 12px;
            font-size: 16px;
            color: #111827;
          ">
            Message
          </h3>

          <div style="
            background-color: #f8faf9;
            border-left: 4px solid #008077;
            border-radius: 8px;
            padding: 18px 20px;
            font-size: 14px;
            line-height: 1.8;
            color: #374151;
            white-space: pre-wrap;
          ">
            ${escapeHtml(cleanMessage)}
          </div>

        </td>
        </tr>

        <!-- REPLY BUTTON -->

        <tr>
        <td style="
          padding: 0 40px 35px;
        ">

          <a
            href="mailto:${escapeHtml(cleanEmail)}"
            style="
              display: inline-block;
              background-color: #008077;
              color: #ffffff;
              text-decoration: none;
              padding: 13px 22px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 700;
            "
          >
            Reply to ${escapeHtml(cleanName)}
          </a>

        </td>
        </tr>

        ${emailFooter}
      `
    });

    if (adminEmailResult.error) {

      console.error(
        "❌ Admin email failed:",
        adminEmailResult.error
      );

    } else {

      console.log(
        "✅ Admin email sent:",
        adminEmailResult.data
      );

    }

    // ====================================================
    // EMAIL 2
    // CUSTOMER CONFIRMATION
    // ====================================================

    const customerEmailResult = await resend.emails.send({

      from: FROM_EMAIL,

      to: [cleanEmail],

      replyTo: ADMIN_EMAIL,

      subject: "We've received your enquiry — NexOrbiX",

      html: `

        ${emailWrapperStart}

        <!-- CUSTOMER HEADER -->

        <tr>
        <td style="
          padding: 10px 40px 10px;
        ">

          <div style="
            width: 54px;
            height: 54px;
            line-height: 54px;
            text-align: center;
            background-color: #e6f5f3;
            border-radius: 50%;
            color: #008077;
            font-size: 25px;
            font-weight: bold;
          ">
            ✓
          </div>

          <h1 style="
            margin: 20px 0 8px;
            font-size: 28px;
            line-height: 1.3;
            color: #111827;
          ">
            Thanks for reaching out!
          </h1>

          <p style="
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
            color: #6b7280;
          ">
            Hi ${escapeHtml(cleanName)}, we've successfully
            received your message.
          </p>

        </td>
        </tr>

        <!-- MAIN MESSAGE -->

        <tr>
        <td style="
          padding: 25px 40px 15px;
        ">

          <p style="
            margin: 0 0 15px;
            font-size: 15px;
            line-height: 1.8;
            color: #374151;
          ">
            Thank you for contacting
            <strong>NexOrbiX Technologies</strong>.
            Our team will review your enquiry and get back
            to you as soon as possible.
          </p>

          <p style="
            margin: 0;
            font-size: 15px;
            line-height: 1.8;
            color: #374151;
          ">
            We've included a copy of your enquiry below
            for your reference.
          </p>

        </td>
        </tr>

        <!-- ENQUIRY SUMMARY -->

        <tr>
        <td style="
          padding: 20px 40px 30px;
        ">

          <div style="
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            background-color: #fafcfb;
          ">

            <p style="
              margin: 0 0 15px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #008077;
            ">
              Your enquiry
            </p>

            <p style="
              margin: 0 0 12px;
              font-size: 14px;
              color: #374151;
            ">
              <strong>Subject:</strong>
              ${escapeHtml(cleanSubject)}
            </p>

            <p style="
              margin: 0;
              font-size: 14px;
              line-height: 1.8;
              color: #374151;
              white-space: pre-wrap;
            ">
              ${escapeHtml(cleanMessage)}
            </p>

          </div>

        </td>
        </tr>

        <!-- RESPONSE NOTE -->

        <tr>
        <td style="
          padding: 0 40px 35px;
        ">

          <div style="
            background-color: #e6f5f3;
            border-radius: 10px;
            padding: 18px 20px;
          ">

            <p style="
              margin: 0;
              font-size: 14px;
              line-height: 1.7;
              color: #135e59;
            ">
              <strong>What happens next?</strong><br>
              Our team will review your enquiry and contact you
              using the email address or phone number you provided.
            </p>

          </div>

        </td>
        </tr>

        <!-- WEBSITE BUTTON -->

        <tr>
        <td align="center" style="
          padding: 0 40px 40px;
        ">

          <a
            href="${WEBSITE_URL}"
            target="_blank"
            style="
              display: inline-block;
              background-color: #008077;
              color: #ffffff;
              text-decoration: none;
              padding: 13px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 700;
            "
          >
            Visit NexOrbiX Technologies
          </a>

        </td>
        </tr>

        ${emailFooter}

      `
    });

    if (customerEmailResult.error) {

      console.error(
        "❌ Customer email failed:",
        customerEmailResult.error
      );

    } else {

      console.log(
        "✅ Customer confirmation email sent:",
        customerEmailResult.data
      );

    }

    // ----------------------------------------------------
    // REDIRECT
    // ----------------------------------------------------

    return res.redirect("/success");

  } catch (error) {

    console.error(
      "❌ Contact Error:",
      error
    );

    return res.status(500).send("Server Error");
  }
};






// const Contact = require("../models/contact");
// const { Resend } = require("resend");

// // Initialize Resend
// const resend = new Resend(process.env.RESEND_API_KEY);

// // Escape HTML to safely display user-submitted content
// const escapeHtml = (value) => {
//   return String(value)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// };

// // POST /contact
// exports.submitContact = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       subject,
//       message
//     } = req.body;

//     // ----------------------------------------------------
//     // VALIDATE FORM FIELDS
//     // ----------------------------------------------------

//     if (!name || !email || !phone || !subject || !message) {
//       return res.status(400).send("All fields are required");
//     }

//     // ----------------------------------------------------
//     // CLEAN VALUES
//     // ----------------------------------------------------

//     const cleanName = name.trim();
//     const cleanEmail = email.trim().toLowerCase();
//     const cleanPhone = phone.trim();
//     const cleanSubject = subject.trim();
//     const cleanMessage = message.trim();

//     // ----------------------------------------------------
//     // SAVE CONTACT ENQUIRY TO MONGODB
//     // ----------------------------------------------------

//     const newContact = new Contact({
//       name: cleanName,
//       email: cleanEmail,
//       phone: cleanPhone,
//       subject: cleanSubject,
//       message: cleanMessage
//     });

//     await newContact.save();

//     console.log("✅ Contact Saved");

//     // ----------------------------------------------------
//     // SEND EMAILS USING RESEND
//     // ----------------------------------------------------

//     if (!process.env.RESEND_API_KEY) {
//       console.error("❌ RESEND_API_KEY is missing");
//       return res.redirect("/success");
//     }

//     const adminEmail = "contact.nexorbix@gmail.com";

//     // ----------------------------------------------------
//     // EMAIL 1: SEND ENQUIRY TO NEXORBIX
//     // ----------------------------------------------------

//     const adminEmailResult = await resend.emails.send({
//       from: "NexOrbiX Website <contact@nexorbix.co.in>",
//       to: [adminEmail],
//       replyTo: cleanEmail,
//       subject: `New Contact Enquiry - ${cleanSubject}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 700px; margin: auto;">

//           <h2 style="margin-bottom: 20px;">
//             New Contact Enquiry
//           </h2>

//           <p>
//             A new enquiry has been submitted through the NexOrbiX website.
//           </p>

//           <hr>

//           <h3>Contact Details</h3>

//           <p>
//             <strong>Name:</strong> ${escapeHtml(cleanName)}
//           </p>

//           <p>
//             <strong>Email:</strong> ${escapeHtml(cleanEmail)}
//           </p>

//           <p>
//             <strong>Phone:</strong> ${escapeHtml(cleanPhone)}
//           </p>

//           <p>
//             <strong>Subject:</strong> ${escapeHtml(cleanSubject)}
//           </p>

//           <h3>Message</h3>

//           <div style="
//             background: #f5f5f5;
//             padding: 15px;
//             border-radius: 8px;
//             white-space: pre-wrap;
//           ">
//             ${escapeHtml(cleanMessage)}
//           </div>

//           <hr>

//           <p style="font-size: 13px; color: #666;">
//             This enquiry was submitted through the NexOrbiX website.
//           </p>

//         </div>
//       `
//     });

//     if (adminEmailResult.error) {
//       console.error(
//         "❌ Admin email failed:",
//         adminEmailResult.error
//       );
//     } else {
//       console.log(
//         "✅ Admin email sent:",
//         adminEmailResult.data
//       );
//     }

//     // ----------------------------------------------------
//     // EMAIL 2: CONFIRMATION EMAIL TO CUSTOMER
//     // ----------------------------------------------------

//     const customerEmailResult = await resend.emails.send({
//       from: "NexOrbiX <contact@nexorbix.co.in>",
//       to: [cleanEmail],
//       replyTo: "contact.nexorbix@gmail.com",
//       subject: "We received your enquiry - NexOrbiX",
//       html: `
//         <div style="
//           font-family: Arial, sans-serif;
//           line-height: 1.6;
//           max-width: 700px;
//           margin: auto;
//         ">

//           <h2>
//             Thank you for contacting NexOrbiX!
//           </h2>

//           <p>
//             Hi ${escapeHtml(cleanName)},
//           </p>

//           <p>
//             Thank you for reaching out to <strong>NexOrbiX Technologies</strong>.
//             We have successfully received your enquiry.
//           </p>

//           <p>
//             Our team will review your message and get back to you
//             as soon as possible.
//           </p>

//           <div style="
//             background: #f5f5f5;
//             padding: 15px;
//             border-radius: 8px;
//             margin: 20px 0;
//           ">

//             <p>
//               <strong>Subject:</strong>
//               ${escapeHtml(cleanSubject)}
//             </p>

//             <p>
//               <strong>Your Message:</strong>
//             </p>

//             <p style="white-space: pre-wrap;">
//               ${escapeHtml(cleanMessage)}
//             </p>

//           </div>

//           <p>
//             Regards,<br>
//             <strong>NexOrbiX Technologies</strong>
//           </p>

//           <hr>

//           <p style="font-size: 12px; color: #666;">
//             This is an automated confirmation email.
//             Please do not reply directly to this message.
//           </p>

//         </div>
//       `
//     });

//     if (customerEmailResult.error) {
//       console.error(
//         "❌ Customer email failed:",
//         customerEmailResult.error
//       );
//     } else {
//       console.log(
//         "✅ Customer confirmation email sent:",
//         customerEmailResult.data
//       );
//     }

//     // ----------------------------------------------------
//     // REDIRECT USER TO SUCCESS PAGE
//     // ----------------------------------------------------

//     return res.redirect("/success");

//   } catch (error) {
//     console.error("❌ Contact Error:", error);

//     return res.status(500).send("Server Error");
//   }
// };






// const Contact = require("../models/contact");

// // POST /contact
// exports.submitContact = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       subject,
//       message
//     } = req.body;

//     // Validate form fields
//     if (!name || !email || !phone || !subject || !message) {
//       return res.status(400).send("All fields are required");
//     }

//     // Clean values
//     const cleanName = name.trim();
//     const cleanEmail = email.trim().toLowerCase();
//     const cleanPhone = phone.trim();
//     const cleanSubject = subject.trim();
//     const cleanMessage = message.trim();

//     // ----------------------------------------------------
//     // SAVE CONTACT ENQUIRY TO MONGODB
//     // ----------------------------------------------------

//     const newContact = new Contact({
//       name: cleanName,
//       email: cleanEmail,
//       phone: cleanPhone,
//       subject: cleanSubject,
//       message: cleanMessage
//     });

//     await newContact.save();

//     console.log("✅ Contact Saved");

//     // ----------------------------------------------------
//     // REDIRECT USER TO SUCCESS PAGE
//     // ----------------------------------------------------

//     return res.redirect("/success");

//   } catch (error) {
//     console.error("❌ Contact Error:", error);

//     return res.status(500).send("Server Error");
//   }
// };