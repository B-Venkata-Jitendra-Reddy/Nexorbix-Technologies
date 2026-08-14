const crypto = require("crypto");
const mongoose = require("mongoose");

const Contact = require("../models/contact");


const ADMIN_COOKIE_NAME = "nexorbix_admin";

const SESSION_DURATION =
    8 * 60 * 60 * 1000; // 8 hours


// ==========================================
// CREATE SIGNED ADMIN TOKEN
// ==========================================

const createAdminToken = (email) => {

    const expiresAt =
        Date.now() + SESSION_DURATION;


    const payload =
        `${email}|${expiresAt}`;


    const signature =
        crypto
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

const safeCompare = (
    value,
    expected
) => {

    if (!value || !expected) {
        return false;
    }


    const valueBuffer =
        Buffer.from(value);


    const expectedBuffer =
        Buffer.from(expected);


    if (
        valueBuffer.length !==
        expectedBuffer.length
    ) {

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

exports.getLogin = (
    req,
    res
) => {

    res.set(
        "Cache-Control",
        "no-store"
    );


    if (req.admin) {

        return res.redirect(
            "/admin/dashboard"
        );

    }


    res.render(
        "admin/login",
        {

            layout: false,

            title: "Admin Login",

            error: null

        }
    );

};


// ==========================================
// POST /admin/login
// ==========================================

exports.login = (
    req,
    res
) => {

    res.set(
        "Cache-Control",
        "no-store"
    );


    const {
        email,
        password
    } = req.body;


    const adminEmail =
        process.env.ADMIN_EMAIL;


    const adminPassword =
        process.env.ADMIN_PASSWORD;


    // Check configuration

    if (
        !adminEmail ||
        !adminPassword ||
        !process.env.ADMIN_SESSION_SECRET
    ) {

        console.error(
            "❌ Admin authentication environment variables are missing."
        );


        return res
            .status(500)
            .render(
                "admin/login",
                {

                    layout: false,

                    title: "Admin Login",

                    error:
                        "Admin authentication is not configured."

                }
            );

    }


    // Validate email

    const validEmail =
        safeCompare(

            String(email || "")
                .trim()
                .toLowerCase(),

            adminEmail
                .trim()
                .toLowerCase()

        );


    // Validate password

    const validPassword =
        safeCompare(

            String(password || ""),

            adminPassword

        );


    // Invalid credentials

    if (
        !validEmail ||
        !validPassword
    ) {

        return res
            .status(401)
            .render(
                "admin/login",
                {

                    layout: false,

                    title: "Admin Login",

                    error:
                        "Invalid email or password."

                }
            );

    }


    // Create token

    const token =
        createAdminToken(
            adminEmail
        );


    // Secure cookie

    res.cookie(
        ADMIN_COOKIE_NAME,
        token,
        {

            httpOnly: true,

            secure:
                process.env.NODE_ENV ===
                "production",

            sameSite: "lax",

            maxAge:
                SESSION_DURATION,

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

exports.getDashboard = async (req, res) => {

    try {

        res.set(
            "Cache-Control",
            "no-store"
        );

        const contacts = await Contact
            .find()
            .sort({
                createdAt: -1
            })
            .lean();

        return res.render(
            "admin/dashboard",
            {
                layout: false,

                title: "Admin Dashboard",

                adminEmail:
                    req.admin.email,

                contacts,

                contactCount:
                    contacts.length
            }
        );

    } catch (error) {

        console.error(
            "❌ Admin Dashboard Error:",
            error
        );

        return res
            .status(500)
            .send(
                "Unable to load admin dashboard."
            );
    }
};


// ==========================================
// DELETE CLIENT CONTACT
// POST /admin/contacts/:id/delete
// ==========================================

exports.deleteContact =
    async (
        req,
        res
    ) => {

        try {

            const {
                id
            } = req.params;


            // Validate MongoDB ObjectId

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res
                    .status(400)
                    .send(
                        "Invalid contact ID."
                    );

            }


            // Delete contact

            const deletedContact =
                await Contact.findByIdAndDelete(
                    id
                );


            if (!deletedContact) {

                return res
                    .status(404)
                    .send(
                        "Client contact not found."
                    );

            }


            console.log(
                `🗑️ Client contact deleted: ${id}`
            );


            return res.redirect(
                "/admin/dashboard?deleted=1"
            );


        } catch (error) {

            console.error(
                "❌ Delete Contact Error:",
                error
            );


            return res
                .status(500)
                .send(
                    "Unable to delete client contact."
                );

        }

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
                process.env.NODE_ENV ===
                "production",

            sameSite: "lax",

            path: "/"

        }
    );


    console.log(
        "✅ Admin logged out"
    );


    return res.redirect(
        "/"
    );

};


// ==========================================
// GET /admin/tables
// ==========================================

exports.getTables = async (req, res) => {

    try {

        res.set(
            "Cache-Control",
            "no-store"
        );


        const contacts = await Contact
            .find()
            .sort({
                createdAt: -1
            })
            .lean();


        return res.render(
            "admin/tables",
            {

                layout: false,

                title: "Contact Data",

                adminEmail:
                    req.admin.email,

                contacts,

                contactCount:
                    contacts.length

            }
        );


    } catch (error) {

        console.error(
            "❌ Admin Tables Error:",
            error
        );


        return res
            .status(500)
            .send(
                "Unable to load contact data."
            );

    }

};