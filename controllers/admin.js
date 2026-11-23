const User = require("../models/users.js");
const Listing = require("../models/listings.js");
const Review = require("../models/reviews.js");
const { cloudinary } = require("../config/cloudeStorage.js");

module.exports.dashboard = async (req, res) => {

    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.render("admin/dashboard", {
        totalUsers,
        totalListings,
        totalReviews
    });
};

module.exports.users = async (req, res) => {

    const users = await User.find({});

    res.render("admin/users", { users });
};

module.exports.listings = async (req, res) => {

    const listings = await Listing.find({})
        .populate("owner");

    res.render("admin/listings", { listings });
};

module.exports.reviews = async (req, res) => {

    // Fetch all reviews and their authors
    const reviews = await Review.find({})
        .populate("author")
        .sort({ createdAt: -1 });


    // Find listings containing these review IDs
    const listings = await Listing.find({
        reviews: {
            $in: reviews.map(review => review._id)
        }
    });


    // Create a map connecting review IDs to listings
    const listingMap = {};

    listings.forEach(listing => {

        listing.reviews.forEach(reviewId => {

            listingMap[reviewId.toString()] = listing;

        });

    });


    // Pass both variables to EJS
    res.render("admin/reviews", {
        reviews,
        listingMap
    });

};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/admin/listings");
    }

    // Delete associated reviews
    await Review.deleteMany({
        _id: { $in: listing.reviews }
    });

    // Delete image from Cloudinary
    if (listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
    }

    // Delete listing
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing and associated data deleted successfully!");
    res.redirect("/admin/listings");
};


module.exports.deleteReview = async (req, res) => {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect("/admin/reviews");
    }

    // Remove review reference from Listing
    await Listing.updateMany(
        { reviews: id },
        { $pull: { reviews: id } }
    );

    await Review.findByIdAndDelete(id);

    req.flash("success", "Review deleted successfully!");
    res.redirect("/admin/reviews");
};
module.exports.toggleAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id === req.user._id.toString()) {
            req.flash("error", "You cannot change your own admin status!");
            return res.redirect("/admin/users");
        }

        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/users");
        }

        if (user.isAdmin) {
            const adminCount = await User.countDocuments({
                isAdmin: true
            });

            if (adminCount <= 1) {
                req.flash("error", "You cannot remove the last administrator!");
                return res.redirect("/admin/users");
            }
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        req.flash(
            "success",
            user.isAdmin
                ? "User promoted to administrator!"
                : "Admin privileges removed!"
        );

        res.redirect("/admin/users");

    } catch (err) {
        next(err);
    }
};