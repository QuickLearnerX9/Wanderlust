const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.js");
const { isAdmin } = require("../middlewares/AdminMiddlewares.js");

// Dashboard
router.get("/", isAdmin, adminController.dashboard);

// Listings
router.get("/listings", isAdmin, adminController.listings);
router.delete("/listings/:id", isAdmin, adminController.deleteListing);

// Reviews
router.get("/reviews", isAdmin, adminController.reviews);
router.delete("/reviews/:id", isAdmin, adminController.deleteReview);


// Users
router.get("/users", isAdmin, adminController.users);
router.post("/users/:id/toggle-admin", isAdmin, adminController.toggleAdmin);

module.exports = router;
