
document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");

    if (!bookingForm) return;

    const checkIn = document.getElementById("checkIn");
    const checkOut = document.getElementById("checkOut");

    const nightCount = document.getElementById("nightCount");
    const nightSubtotal = document.getElementById("nightSubtotal");
    const bookingTotal = document.getElementById("bookingTotal");

    const price = Number(window.bookingListingPrice);

    const formatPrice = (amount) => {
        return "₹" + amount.toLocaleString("en-IN");
    };

    function updateBookingPrice() {
        if (!checkIn.value || !checkOut.value) return;

        const start = new Date(checkIn.value + "T00:00:00Z");
        const end = new Date(checkOut.value + "T00:00:00Z");

        const nights = Math.round(
            (end - start) / (1000 * 60 * 60 * 24)
        );

        if (nights <= 0) {
            nightCount.textContent = "0";
            nightSubtotal.textContent = "₹0";
            bookingTotal.textContent = "₹0";
            return;
        }

        const total = nights * price;

        nightCount.textContent = nights;
        nightSubtotal.textContent = formatPrice(total);
        bookingTotal.textContent = formatPrice(total);
    }

    checkIn.addEventListener("change", () => {
        checkOut.min = checkIn.value;

        if (checkOut.value && checkOut.value <= checkIn.value) {
            checkOut.value = "";
        }

        updateBookingPrice();
    });

    checkOut.addEventListener("change", updateBookingPrice);

    bookingForm.addEventListener("submit", (event) => {
        if (
            !checkIn.value ||
            !checkOut.value ||
            checkOut.value <= checkIn.value ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            event.preventDefault();
            alert("Please select valid check-in and check-out dates.");
        }
    });
});
