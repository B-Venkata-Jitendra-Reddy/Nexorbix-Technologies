const Contact = require("../models/Contact");

exports.getClientdataPage = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.render("clientdata", {
      title: "Client Data",
      contacts: contacts
    });

  } catch (error) {
    console.log(error);
    res.send("Error loading client data");
  }
};