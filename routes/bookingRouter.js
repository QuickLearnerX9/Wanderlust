const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middlewares/Middleware.js");
const bookingController = require("../controllers/bookings.js");

router.use(isLoggedIn);

// Keep fixed paths before /:id so "my" and "host" are not treated as IDs.
router.get("/my", wrapAsync(bookingController.myBookings));
router.get("/host", wrapAsync(bookingController.hostBookings));
router.post("/:listingId", wrapAsync(bookingController.createBooking));
router.get("/:id", wrapAsync(bookingController.showBooking));
router.patch("/:id/confirm", wrapAsync(bookingController.confirmBooking));
router.patch("/:id/reject", wrapAsync(bookingController.rejectBooking));
router.patch("/:id/cancel", wrapAsync(bookingController.cancelBooking));

module.exports = router;
