// Mapbox interactive map with hover popup
(function() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (!mapToken || mapToken.trim() === "" || mapToken === "undefined") {
        mapContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center h-100 bg-light rounded-4 p-4 text-center border">
                <i class="fa-solid fa-map-location-dot text-danger fa-3x mb-3"></i>
                <h5 class="fw-bold text-dark">Interactive Map View</h5>
                <p class="text-muted mb-2">Location: <b>${listing.location || ''}, ${listing.country || ''}</b></p>
                <div class="alert alert-warning py-2 px-3 small mb-0">
                    <i class="fa-solid fa-triangle-exclamation me-1"></i> Add <code>MAP_TOKEN=your_mapbox_token</code> in your <code>.env</code> file to enable live Mapbox rendering.
                </div>
            </div>
        `;
        return;
    }

    try {
        mapboxgl.accessToken = mapToken;

        const coordinates = (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2)
            ? listing.geometry.coordinates
            : [77.2090, 28.6139]; // Default coordinates (Delhi)

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: coordinates,
            zoom: 11
        });

        // Add zoom and rotation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Create Custom Hover Popup
        const popup = new mapboxgl.Popup({
            offset: 30,
            closeButton: true,
            closeOnClick: false,
            className: 'custom-mapbox-popup'
        }).setHTML(`
            <div class="p-2" style="max-width: 260px; font-family: inherit;">
                <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle rounded-pill px-2 py-1" style="font-size: 0.7rem;">
                        ${listing.category || 'Featured'}
                    </span>
                    <span class="text-muted" style="font-size: 0.75rem;">
                        <i class="fa-solid fa-star text-warning"></i> ${typeof listing.avgRating === 'number' ? listing.avgRating : 0}
                    </span>
                </div>
                <h6 class="fw-bold mb-1 text-truncate" style="color: #fe424d; font-size: 0.95rem;">${listing.title}</h6>
                <p class="mb-1 text-muted" style="font-size: 0.85rem;">
                    <i class="fa-solid fa-location-dot text-danger me-1"></i><b>${listing.location}</b>, ${listing.country}
                </p>
                <p class="mb-2 text-dark fw-bold" style="font-size: 0.88rem;">
                    &#8377; ${Number(listing.price).toLocaleString("en-IN")} <span class="fw-normal text-muted" style="font-size: 0.75rem;">/ night</span>
                </p>
                <div class="pt-2 border-top mt-1">
                    <p class="text-secondary mb-2" style="font-size: 0.78rem; line-height: 1.35;">
                        <i class="fa-solid fa-circle-info text-primary me-1"></i>Exact address is provided after booking. Contact us or book your room today!
                    </p>
                    <div class="d-grid gap-1">
                        <a href="mailto:booking@wanderlust.com?subject=Booking Inquiry for ${encodeURIComponent(listing.title)}" class="btn btn-sm btn-danger fw-semibold py-1 rounded-pill" style="font-size: 0.75rem; background-color: #fe424d; border: none;">
                            <i class="fa-solid fa-calendar-check me-1"></i>Book Our Room
                        </a>
                        <a href="mailto:support@wanderlust.com?subject=Inquiry for ${encodeURIComponent(listing.title)}" class="btn btn-sm btn-outline-secondary fw-semibold py-1 rounded-pill" style="font-size: 0.75rem;">
                            <i class="fa-solid fa-headset me-1"></i>Contact Us
                        </a>
                    </div>
                </div>
            </div>
        `);

        // Create Marker
        const marker = new mapboxgl.Marker({ color: '#fe424d' })
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);

        // Marker Element Event Listeners for Hover
        const markerDiv = marker.getElement();
        markerDiv.style.cursor = 'pointer';

        // Show pop-up when hovering over the marker
        markerDiv.addEventListener('mouseenter', () => {
            popup.addTo(map);
        });

    } catch (err) {
        console.error("Mapbox map initialization error:", err);
        mapContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center h-100 bg-light rounded-4 p-4 text-center border">
                <i class="fa-solid fa-map-location-dot text-danger fa-3x mb-3"></i>
                <h5 class="fw-bold">Unable to load map</h5>
                <p class="text-muted small">${err.message || 'Please check your Mapbox access token'}</p>
            </div>
        `;
    }
})();
