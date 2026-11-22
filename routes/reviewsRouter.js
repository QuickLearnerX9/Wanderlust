const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const { validateReview } = require("../utils/schemaValidator.js");
const { isLoggedIn, isReviewAuthor } = require("../middlewares/Middleware.js");
const reviewController = require('../controllers/reviews.js');

// Reviews Post Route
router.route('/')
  .post(isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review Route
router.route('/:reviewId')
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;