const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema({
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    guests: { type: Number, required: true, min: 1, max: 16 },
    pricePerNight: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ["pending", "confirmed", "rejected", "cancelled"],
        default: "pending",
        index: true
    }
}, { timestamps: true });

bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ host: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
