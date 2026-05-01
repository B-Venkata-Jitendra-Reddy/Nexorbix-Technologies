require('dns').setDefaultResultOrder('ipv4first');
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

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Layouts
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ROUTES
const dashboardRoutes = require("./routers/dashboard");
const contactRoutes = require("./routers/contact");
const clientdataRoutes = require("./routers/clientdata");

app.use("/", dashboardRoutes);
app.use("/contact", contactRoutes);
app.use("/clientdata", clientdataRoutes)

// Test Route
app.get("/home", (req, res) => {
  res.send("Nexora Pvt Ltd Success");
});

// DATABASE
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

const dbUrl = process.env.MONGO_URI;

main().then( () => {
    console.log("Connected TO DB")
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
};

// SERVER
const PORT = process.env.PORT || 2500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});