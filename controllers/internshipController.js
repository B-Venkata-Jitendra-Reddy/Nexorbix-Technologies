
const InternshipRegistration = require("../models/InternshipRegistration");
const { DOMAINS } = require("../models/InternshipRegistration");

const ALLOWED_STATUSES = ["Student", "Graduate", "Fresher"];
const ALLOWED_DEGREES = ["BCA", "MCA", "B.Tech", "M.Tech", "Other"];
const ALLOWED_EXPERIENCE = ["Yes", "No"];
const ALLOWED_SETUP = ["Yes", "No", "Maybe"];

const clean = (value) =>
    typeof value === "string" ? value.trim() : "";

const fail = (res, status, message) =>
    res.status(status).json({ success: false, message });

exports.registerInternship = async (req, res) => {
    try {
        const body = req.body || {};

        const fullName = clean(body.fullName);
        const email = clean(body.email).toLowerCase();
        const phone = clean(body.phone);
        const city = clean(body.city);
        const currentStatus = clean(body.currentStatus);
        const selectedDegree = clean(body.degree);
        const otherDegree = clean(body.otherDegree);
        const college = clean(body.college);
        const fieldOfStudy = clean(body.fieldOfStudy);
        const preferredDomain = clean(body.preferredDomain);
        const skills = clean(body.skills);
        const hasExperience = clean(body.hasExperience);
        const experienceDetails = clean(body.experienceDetails);
        const setup = clean(body.setup);

        // Required text fields and basic size limits.
        const requiredFields = [
            [fullName, "Full name"],
            [email, "Email address"],
            [phone, "Phone number"],
            [city, "City"],
            [currentStatus, "Current status"],
            [selectedDegree, "Course / degree"],
            [college, "College name"],
            [fieldOfStudy, "Field of study"],
            [preferredDomain, "Preferred domain"],
            [skills, "Skills"],
            [hasExperience, "Prior experience"],
            [setup, "Laptop and internet availability"],
        ];

        for (const [value, label] of requiredFields) {
            if (!value) {
                return fail(res, 400, `${label} is required.`);
            }
        }

        if (fullName.length < 2 || fullName.length > 100) {
            return fail(res, 400, "Full name must contain 2–100 characters.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return fail(res, 400, "Enter a valid email address.");
        }

        if (!/^[0-9+()\-\s]{7,18}$/.test(phone)) {
            return fail(res, 400, "Enter a valid phone number.");
        }

        if (city.length > 100 || college.length > 200 ||
            fieldOfStudy.length > 150 || skills.length > 2000) {
            return fail(res, 400, "One or more fields exceed the allowed length.");
        }

        if (!ALLOWED_STATUSES.includes(currentStatus)) {
            return fail(res, 400, "Select a valid current status.");
        }

        if (!ALLOWED_DEGREES.includes(selectedDegree)) {
            return fail(res, 400, "Select a valid course or degree.");
        }

        const degree =
            selectedDegree === "Other" ? otherDegree : selectedDegree;

        if (!degree || degree.length > 100) {
            return fail(res, 400, "Enter your course or degree.");
        }

        if (!DOMAINS.includes(preferredDomain)) {
            return fail(res, 400, "Select a valid internship domain.");
        }

        if (!ALLOWED_EXPERIENCE.includes(hasExperience)) {
            return fail(res, 400, "Select your prior experience status.");
        }

        if (hasExperience === "Yes" && !experienceDetails) {
            return fail(res, 400, "Please describe your prior experience.");
        }

        if (experienceDetails.length > 3000) {
            return fail(res, 400, "Experience description is too long.");
        }

        if (!ALLOWED_SETUP.includes(setup)) {
            return fail(res, 400, "Select your laptop and internet availability.");
        }

        if (body.declaration !== true && body.declaration !== "true" &&
            body.declaration !== "on") {
            return fail(res, 400, "Please accept the declaration to continue.");
        }

        const registration = await InternshipRegistration.create({
            fullName,
            email,
            phone,
            city,
            currentStatus,
            degree,
            college,
            fieldOfStudy,
            preferredDomain,
            skills,
            hasExperience,
            experienceDetails: hasExperience === "Yes" ? experienceDetails : "",
            setup,
            declaration: true,
        });

        return res.status(201).json({
            success: true,
            message: "Your internship registration has been saved successfully.",
            registrationId: registration.registrationId,
        });
    } catch (error) {
        console.error("Internship registration error:", error);

        if (error.name === "ValidationError") {
            return fail(res, 400, "Please check your details and try again.");
        }

        if (error.name === "MongoServerSelectionError" ||
            error.name === "MongooseServerSelectionError") {
            return fail(res, 503, "Registration service is temporarily unavailable.");
        }

        return fail(res, 500, "Unable to save your registration. Please try again.");
    }
};
