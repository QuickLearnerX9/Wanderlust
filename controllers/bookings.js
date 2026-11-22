const mongoose = require("mongoose");
const Booking = require("../models/booking.js");
const Listing = require("../models/listings.js");

const ACTIVE_STATUSES = ["pending", "confirmed"];
const DAY_MS = 24 * 60 * 60 * 1000;

// HTML date inputs send YYYY-MM-DD. Store date-only values at UTC midnight
// to avoid timezone shifts when comparing check-in/check-out dates.
function parseDateOnly(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
    return date;
}

function todayUtc() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function overlapsQuery(listingId, checkIn, checkOut, excludeId) {
    const query = {
        listing: listingId,
        status: { $in: ACTIVE_STATUSES },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
    };
    if (excludeId) query._id = { $ne: excludeId };
    return query;
}

module.exports.createBooking = async (req, res) => {
    const { listingId } = req.params;
    const { checkIn: rawCheckIn, checkOut: rawCheckOut, guests: rawGuests } = req.body;

    if (!mongoose.isValidObjectId(listingId)) {
        req.flash("error", "That property could not be found.");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
        req.flash("error", "That property could not be found.");
        return res.redirect("/listings");
    }

    if (!listing.owner) {
        req.flash("error", "This property does not have a host assigned yet, so it cannot accept booking requests.");
        return res.redirect(`/listings/${listingId}`);
    }
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own property.");
        return res.redirect(`/listings/${listingId}`);
    }

    const checkIn = parseDateOnly(rawCheckIn);
    const checkOut = parseDateOnly(rawCheckOut);
    const guests = Number(rawGuests);

    if (!checkIn || !checkOut || checkIn < todayUtc() || checkOut <= checkIn) {
        req.flash("error", "Choose valid dates. Check-out must be after check-in, and check-in cannot be in the past.");
        return res.redirect(`/listings/${listingId}`);
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 16) {
        req.flash("error", "Choose between 1 and 16 guests.");
        return res.redirect(`/listings/${listingId}`);
    }

    const nights = (checkOut.getTime() - checkIn.getTime()) / DAY_MS;
    const pricePerNight = Number(listing.price);
    const totalPrice = nights * pricePerNight;

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
        req.flash("error", "We could not calculate the booking price.");
        return res.redirect(`/listings/${listingId}`);
    }

    const conflict = await Booking.findOne(overlapsQuery(listing._id, checkIn, checkOut));
    if (conflict) {
        req.flash("error", "Those dates are not available. Please choose different dates.");
        return res.redirect(`/listings/${listingId}`);
    }

    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        host: listing.owner,
        checkIn,
        checkOut,
        nights,
        guests,
        pricePerNight,
        totalPrice,
        status: "pending"
    });

    await booking.save();
    req.flash("success", "Your booking request has been sent to the host!");
    res.redirect(`/bookings/${booking._id}`);
};

module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .populate("host", "username email")
        .sort({ createdAt: -1 });
    res.render("bookings/myBookings.ejs", { bookings });
};

module.exports.hostBookings = async (req, res) => {
    const bookings = await Booking.find({ host: req.user._id })
        .populate("listing")
        .populate("user", "username email")
        .sort({ createdAt: -1 });
    res.render("bookings/hostBookings.ejs", { bookings });
};

module.exports.showBooking = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/my");
    }
    const booking = await Booking.findById(req.params.id)
        .populate("listing")
        .populate("user", "username email")
        .populate("host", "username email");

    if (!booking || !booking.listing) {
        req.flash("error", "Booking or its property could not be found.");
        return res.redirect("/bookings/my");
    }

    const isGuest = booking.user._id.equals(req.user._id);
    const isHost = booking.host._id.equals(req.user._id);
    if (!isGuest && !isHost) {
        req.flash("error", "You are not allowed to view this booking.");
        return res.redirect("/listings");
    }
    res.render("bookings/show.ejs", { booking, isGuest, isHost });
};

module.exports.confirmBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/host");
    }
    if (!booking.host.equals(req.user._id)) {
        req.flash("error", "Only this property's host can confirm the request.");
        return res.redirect("/bookings/host");
    }
    if (booking.status !== "pending") {
        req.flash("error", "Only pending requests can be confirmed.");
        return res.redirect(`/bookings/${booking._id}`);
    }

    const conflict = await Booking.findOne(overlapsQuery(
        booking.listing, booking.checkIn, booking.checkOut, booking._id
    ));
    if (conflict) {
        req.flash("error", "These dates now conflict with another active booking. This request cannot be confirmed.");
        return res.redirect(`/bookings/${booking._id}`);
    }

    booking.status = "confirmed";
    await booking.save();
    req.flash("success", "Booking confirmed successfully.");
    res.redirect(`/bookings/${booking._id}`);
};

module.exports.rejectBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/host");
    }
    if (!booking.host.equals(req.user._id)) {
        req.flash("error", "Only this property's host can reject the request.");
        return res.redirect("/bookings/host");
    }
    if (booking.status !== "pending") {
        req.flash("error", "Only pending requests can be rejected.");
        return res.redirect(`/bookings/${booking._id}`);
    }
    booking.status = "rejected";
    await booking.save();
    req.flash("success", "Booking request rejected. The dates are available again.");
    res.redirect(`/bookings/${booking._id}`);
};

module.exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/my");
    }
    const isGuest = booking.user.equals(req.user._id);
    const isHost = booking.host.equals(req.user._id);
    if (!isGuest && !isHost) {
        req.flash("error", "You are not allowed to cancel this booking.");
        return res.redirect("/listings");
    }
    if (!["pending", "confirmed"].includes(booking.status)) {
        req.flash("error", "This booking can no longer be cancelled.");
        return res.redirect(`/bookings/${booking._id}`);
    }
    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Booking cancelled. The dates are available again.");
    res.redirect(`/bookings/${booking._id}`);
};
