const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

dotenv.config();

const app = express();

// MIDDLEWARE

// Body Parser (VERY IMPORTANT)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================================================
// COOKIE PARSER
// =====================================================

// Small built-in cookie parser.
// No cookie-parser package required.
app.use((req, res, next) => {

  req.cookies = {};

  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {

    cookieHeader.split(";").forEach((cookie) => {

      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex === -1) {
        return;
      }

      const name = cookie
        .substring(0, separatorIndex)
        .trim();

      const value = cookie
        .substring(separatorIndex + 1)
        .trim();

      if (name) {

        req.cookies[name] = decodeURIComponent(value);

      }

    });

  }

  next();

});

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Layouts
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err.message));

// ROUTES
const dashboardRoutes = require("./routers/dashboardRoutes");
const contactRoutes = require("./routers/contactRoutes");
const adminRoutes = require("./routers/adminRoutes");

// Public website routes
app.use("/", dashboardRoutes);
// Contact routes
app.use("/", contactRoutes);
// Admin routes
app.use("/admin", adminRoutes);


app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).send("Something went wrong!");
});


app.use((req, res) => {
  res.status(404).render("404");
});


// SERVER
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {

  console.log(
    `🚀 NexOrbiX server running on port ${PORT}`
  );

  console.log(
    `🔐 Admin login: http://localhost:${PORT}/admin/login`
  );

});