const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { validateListing } = require("../utils/schemaValidator.js");
const { isLoggedIn, isOwner, upload } = require("../middlewares/Middleware.js"); // Added isOwner
const listingController = require('../controllers/listings.js');


// --- INDEX & CREATE ROUTES (Root: /) ---
router.route('/')
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("uploaded_file"), validateListing, wrapAsync(listingController.createListing));

// --- NEW ROUTE ---
router.get("/new", isLoggedIn, listingController.renderNewForm);

// --- SHOW, UPDATE, & DELETE ROUTES (Root: /:id) ---
router.route('/:id')
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single("uploaded_file"),validateListing, wrapAsync(listingController.updateListing)) // Added isOwner
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); // Added isOwner

// --- EDIT ROUTE ---
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)); // Added isOwner

module.exports = router;