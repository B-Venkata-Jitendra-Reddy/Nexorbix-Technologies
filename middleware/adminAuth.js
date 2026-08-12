const crypto = require("crypto");

const ADMIN_COOKIE_NAME = "nexorbix_admin";

const verifyAdminToken = (token) => {
  try {
    if (!token || !process.env.ADMIN_SESSION_SECRET) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, signature] = parts;

    const payload = Buffer
      .from(encodedPayload, "base64url")
      .toString("utf8");

    const separatorIndex = payload.lastIndexOf("|");

    if (separatorIndex === -1) {
      return null;
    }

    const email = payload.substring(0, separatorIndex);
    const expiresAt = Number(
      payload.substring(separatorIndex + 1)
    );

    // Invalid expiry
    if (!email || !expiresAt || Date.now() > expiresAt) {
      return null;
    }

    // Re-create signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
      .update(payload)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    // Make sure the token belongs to the configured admin
    if (
      email.toLowerCase() !==
      String(process.env.ADMIN_EMAIL || "").trim().toLowerCase()
    ) {
      return null;
    }

    return {
      email,
      expiresAt
    };

  } catch (error) {
    console.error("Admin token verification error:", error.message);
    return null;
  }
};


// -----------------------------
// Protect admin routes
// -----------------------------
exports.requireAdmin = (req, res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  const admin = verifyAdminToken(token);

  if (!admin) {
    res.clearCookie(ADMIN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return res.redirect("/admin/login");
  }

  req.admin = admin;

  next();
};


// -----------------------------
// Optional helper for login page
// -----------------------------
exports.checkAdmin = (req, res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  const admin = verifyAdminToken(token);

  if (admin) {
    req.admin = admin;
  }

  next();
};