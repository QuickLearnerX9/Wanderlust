// Inside middlewares/Middleware.js (or wherever your middleware is defined)
const Listing = require('../models/listings.js');
const Review = require('../models/reviews.js');
const multer = require("multer");
const { storage } = require("../config/cloudeStorage.js");
const upload = multer({ storage });

module.exports.upload = upload;


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please log in to continue.");
        return res.redirect("/auth/login");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    // Check if the listing exists first
    if (!listing) {
        req.flash("error", "The listing you are looking for does not exist!");
        return res.redirect("/listings");
    }

    // Compare the listing owner with the currently logged-in user
    // Note: Adjust 'listing.owner' or 'user._id' depending on how your schema references them
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    
    if (!review) {
        req.flash("error", "The review you are looking for does not exist!");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of the review.");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};