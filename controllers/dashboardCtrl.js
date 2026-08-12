exports.getHomePage = (req, res) => {
    res.render('home', {
        title: 'Home Page',
    });
};

exports.getAboutPage = (req, res) => {
    res.render('about', {
        title: 'About Us Page',
    });
};

exports.getServicesPage = (req, res) => {
    res.render('services', {
        title: 'Our Services Page',
    });
};

exports.getProductsPage = (req, res) => {
    res.render('products', {
        title: 'Our Products Page',
    });
};

exports.getCareerPage = (req, res) => {
    res.render('career', {
        title: 'Careers Page',
    });
};

exports.getContactPage = (req, res) => {
    res.render('contact', {
        title: 'Contact Us Page',
    });
};

exports.getSuccessPage = (req, res) => {
    res.render('success', {
        title: 'Success Page',
    });
};
