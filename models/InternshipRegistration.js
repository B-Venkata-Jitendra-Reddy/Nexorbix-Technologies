const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const DOMAINS = [
    "AI & Generative AI",
    "Full Stack Web Development",
    "Python Development",
    "Machine Learning",
    "Cyber Security",
    "Cloud Computing",
    "Data Analytics",
];

const internshipRegistrationSchema = new mongoose.Schema(
    {
        registrationId: {
            type: String,
            default: () => `NXI-${randomUUID().slice(0, 8).toUpperCase()}`,
            unique: true,
            index: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            index: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9+()\-\s]{7,18}$/,
        },

        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        currentStatus: {
            type: String,
            required: true,
            enum: ["Student", "Graduate", "Fresher"],
        },

        degree: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        college: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        fieldOfStudy: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        preferredDomain: {
            type: String,
            required: true,
            enum: DOMAINS,
        },

        skills: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 2000,
        },

        hasExperience: {
            type: String,
            required: true,
            enum: ["Yes", "No"],
        },

        experienceDetails: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },

        setup: {
            type: String,
            required: true,
            enum: ["Yes", "No", "Maybe"],
        },

        declaration: {
            type: Boolean,
            required: true,
            validate: {
                validator: (value) => value === true,
                message: "The declaration must be accepted.",
            },
        },

        status: {
            type: String,
            enum: ["Submitted", "Under Review", "Accepted", "Rejected"],
            default: "Submitted",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Experience details are mandatory only when the applicant answers Yes.
internshipRegistrationSchema.pre("validate", function (next) {
    if (this.hasExperience === "Yes" && !this.experienceDetails?.trim()) {
        this.invalidate(
            "experienceDetails",
            "Please describe your prior experience."
        );
    }

    if (this.hasExperience === "No") {
        this.experienceDetails = "";
    }

    next();
});

module.exports = mongoose.model(
    "InternshipRegistration",
    internshipRegistrationSchema
);

module.exports.DOMAINS = DOMAINS;
