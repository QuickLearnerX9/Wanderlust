const Listing = require('../models/listings.js');
const Review = require('../models/reviews.js');

module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "The listing you are trying to review does not exist!");
        return res.redirect("/listings");
    }
    

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Assign current user ID as author
    newReview.createdAt = new Date();

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};