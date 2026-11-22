document.addEventListener('DOMContentLoaded', () => {
    const rangeInput = document.getElementById('reviewRating');
    const ratingLabel = document.getElementById('ratingLabel');
    const steps = document.querySelectorAll('.rating-step');

    const ratingsMap = {
      1: { text: "Terrible", class: "text-danger" },
      2: { text: "Poor", class: "text-warning" },
      3: { text: "Average", class: "text-secondary" },
      4: { text: "Good", class: "text-primary" },
      5: { text: "Excellent", class: "text-success" }
    };

    function updateRating(val) {
      const ratingData = ratingsMap[val];
      
      // Update label text and sentiment color
      ratingLabel.textContent = `${val} - ${ratingData.text}`;
      ratingLabel.className = `fw-bold ${ratingData.class}`;

      // Update active state for the steps, dots, and badges
      steps.forEach(step => {
        if (step.getAttribute('data-val') === val) {
          step.classList.add('active-step');
        } else {
          step.classList.remove('active-step');
        }
      });
    }

    // Run on initial load to match default value (3)
    updateRating(rangeInput.value);

    // Run whenever the user slides
    rangeInput.addEventListener('input', (e) => {
      updateRating(e.target.value);
    });
  });