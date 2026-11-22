const mongoose = require("mongoose");
const Review = require('./reviews.js');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRva3lvfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            set: (v) => (v === "" ? "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRva3lvfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60" : v),
        }
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Matches mongoose.model('User', UserSchema)
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Castles",
            "Amazing Pools",
            "Camping",
            "Farms",
            "Arctic",
            "Domes",
            "Boats"
        ],
        default: "Trending"
    }
});

// Virtual property to calculate average rating across reviews (or 0 if none)
listingSchema.virtual('avgRating').get(function () {
    if (!this.reviews || this.reviews.length === 0) {
        return 0;
    }
    const validRatings = this.reviews
        .filter(r => r && typeof r.rating === 'number')
        .map(r => r.rating);
    if (validRatings.length === 0) {
        return 0;
    }
    const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
    return parseFloat((sum / validRatings.length).toFixed(1));
});

listingSchema.set('toObject', { virtuals: true });
listingSchema.set('toJSON', { virtuals: true });

// Post middleware for handling cascade deletion of reviews
listingSchema.post("findOneAndDelete", async function(listing) {
    if (listing && listing.reviews.length > 0) {
        // Delete all reviews whose IDs are present in the deleted listing's reviews array
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;