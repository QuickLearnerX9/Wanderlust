const Joi = require('joi');
const ExpressError = require("./expressError.js");

// Define the Joi schema for listing validation
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null).optional(),
            filename: Joi.string().allow("", null).optional()
        }).allow("", null).optional(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        category: Joi.string().valid(
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
        ).optional()
    }).required(),
}).unknown(true);

// Create a reusable validation middleware function
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        return next(new ExpressError(400, errMsg)); // ✅ Use next() instead of throw
    } else {
        next(); // Proceed to the route handler if validation passes
    }
};



// Define the Joi schema matching your form's review object structure
const reviewValidationSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required().trim()
    }).required()
});

// Middleware function to validate requests
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        // Assuming you have a custom ExpressError class or handle it with status 400
        return next(new ExpressError(400, errMsg));
    } else {
        next();
    }
};;