(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');

      for (const control of form.elements) {
        if (control.willValidate) {
          control.setAttribute('aria-invalid', String(!control.validity.valid));
        }
      }
    }, false);

    form.addEventListener('input', event => {
      const control = event.target;
      if (control.willValidate && control.hasAttribute('aria-invalid')) {
        control.setAttribute('aria-invalid', String(!control.validity.valid));
      }
    });
  });

  // Tax Toggle Switch functionality
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  if (taxSwitch) {
    taxSwitch.addEventListener("click", () => {
      const taxInfo = document.getElementsByClassName("tax-info");
      for (let info of taxInfo) {
        if (info.style.display !== "inline") {
          info.style.display = "inline";
        } else {
          info.style.display = "none";
        }
      }
    });
  }
})();