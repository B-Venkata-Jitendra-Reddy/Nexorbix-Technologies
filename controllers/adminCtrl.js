const crypto = require("crypto");

const ADMIN_COOKIE_NAME = "nexorbix_admin";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours


// ==========================================
// CREATE SIGNED ADMIN TOKEN
// ==========================================

const createAdminToken = (email) => {

    const expiresAt = Date.now() + SESSION_DURATION;

    const payload = `${email}|${expiresAt}`;

    const signature = crypto
        .createHmac(
            "sha256",
            process.env.ADMIN_SESSION_SECRET
        )
        .update(payload)
        .digest("hex");

    return `${Buffer
        .from(payload)
        .toString("base64url")}.${signature}`;
};


// ==========================================
// SAFE STRING COMPARISON
// ==========================================

const safeCompare = (value, expected) => {

    if (!value || !expected) {
        return false;
    }

    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (valueBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        valueBuffer,
        expectedBuffer
    );
};


// ==========================================
// GET /admin/login
// ==========================================

exports.getLogin = (req, res) => {

    res.set(
        "Cache-Control",
        "no-store"
    );

    if (req.admin) {
        return res.redirect("/admin/dashboard");
    }

    res.render("admin/login", {

        // IMPORTANT:
        // Prevent public NexOrbiX navbar/footer
        layout: false,

        title: "Admin Login",

        error: null

    });

};


// ==========================================
// POST /admin/login
// ==========================================

exports.login = (req, res) => {

    res.set(
        "Cache-Control",
        "no-store"
    );

    const { email, password } = req.body;

    const adminEmail =
        process.env.ADMIN_EMAIL;

    const adminPassword =
        process.env.ADMIN_PASSWORD;


    // Check environment configuration

    if (
        !adminEmail ||
        !adminPassword ||
        !process.env.ADMIN_SESSION_SECRET
    ) {

        console.error(
            "❌ Admin authentication environment variables are missing."
        );

        return res.status(500).render(
            "admin/login",
            {

                // IMPORTANT
                layout: false,

                title: "Admin Login",

                error:
                    "Admin authentication is not configured."

            }
        );

    }


    // Validate email

    const validEmail = safeCompare(

        String(email || "")
            .trim()
            .toLowerCase(),

        adminEmail
            .trim()
            .toLowerCase()

    );


    // Validate password

    const validPassword = safeCompare(

        String(password || ""),

        adminPassword

    );


    // Invalid credentials

    if (!validEmail || !validPassword) {

        return res.status(401).render(
            "admin/login",
            {

                // IMPORTANT
                layout: false,

                title: "Admin Login",

                error:
                    "Invalid email or password."

            }
        );

    }


    // Create authentication token

    const token =
        createAdminToken(adminEmail);


    // Set HTTP-only cookie

    res.cookie(
        ADMIN_COOKIE_NAME,
        token,
        {

            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite: "lax",

            maxAge: SESSION_DURATION,

            path: "/"

        }
    );


    console.log(
        "✅ Admin login successful"
    );


    return res.redirect(
        "/admin/dashboard"
    );

};


// ==========================================
// GET /admin/dashboard
// ==========================================

exports.getDashboard = async (
    req,
    res
) => {

    res.set(
        "Cache-Control",
        "no-store"
    );


    res.render(
        "admin/dashboard",
        {

            // IMPORTANT:
            // Do NOT use public boilerplate layout
            layout: false,

            title: "Admin Dashboard",

            adminEmail:
                req.admin.email

        }
    );

};


// ==========================================
// GET /admin/logout
// ==========================================

exports.logout = (req, res) => {

    res.clearCookie(
        ADMIN_COOKIE_NAME,
        {

            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite: "lax",

            path: "/"

        }
    );


    console.log(
        "✅ Admin logged out"
    );


    return res.redirect(
        "/admin/login"
    );

};