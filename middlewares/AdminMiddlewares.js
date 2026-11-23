module.exports.isAdmin = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "Please login first!");
        return res.redirect("/login");
    }

    if (!req.user.isAdmin) {
        req.flash("error", "Access denied! Admin only.");
        return res.redirect("/listings");
    }

    next();
};