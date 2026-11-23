const Listing = require('../models/listings.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

module.exports.index = async (req, res) => {
    const { q, category } = req.query;
    let filter = {};

    if (category && category !== "All") {
        filter.category = category;
    }

    if (q && q.trim() !== "") {
        const regex = new RegExp(q.trim(), "i");
        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { category: regex }
        ];
    }

    const allListings = await Listing.find(filter).populate('reviews');;

    res.render("listings/index.ejs", { allListings, selectedCategory: category, searchQuery: q || "" });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author", // Populates the author of each review
            },
        })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        return res.redirect("/listings");
    }
    
    res.render('listings/show.ejs', { listing });
};

module.exports.createListing = async (req, res) => {
    let geoResponse = null;
    if (geocodingClient && req.body.listing && req.body.listing.location) {
        try {
            geoResponse = await geocodingClient.forwardGeocode({
                query: `${req.body.listing.location}, ${req.body.listing.country || ""}`,
                limit: 1
            }).send();
        } catch (err) {
            console.error("Mapbox Geocoding Error:", err.message);
        }
    }

    let newListing = new Listing(req.body.listing);

    if (geoResponse && geoResponse.body && geoResponse.body.features && geoResponse.body.features.length) {
        newListing.geometry = geoResponse.body.features[0].geometry;
    } else {
        // Fallback default coordinates (New Delhi: [77.2090, 28.6139])
        newListing.geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
    }

    // Store Cloudinary image details
    if (req.file) {
        newListing.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    }

    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "The listing you are trying to edit does not exist!");
        return res.redirect("/listings");
    }

    let previewImage = listing.image && listing.image.url ? listing.image.url.replace(
        "/upload/",
        "/upload/w_300,h_200,c_fill,q_30,f_auto/"
    ) : "";

    res.render("listings/edit.ejs", { listing, previewImage });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true, new: true }
    );

    if (geocodingClient && req.body.listing && req.body.listing.location) {
        try {
            let geoResponse = await geocodingClient.forwardGeocode({
                query: `${req.body.listing.location}, ${req.body.listing.country || ""}`,
                limit: 1
            }).send();
            if (geoResponse && geoResponse.body && geoResponse.body.features && geoResponse.body.features.length) {
                listing.geometry = geoResponse.body.features[0].geometry;
            }
        } catch (err) {
            console.error("Mapbox Geocoding Error on Update:", err.message);
        }
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
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
    let deletedListing = await Listing.findByIdAndDelete(id);
    
    console.log("Deleted:", deletedListing);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};