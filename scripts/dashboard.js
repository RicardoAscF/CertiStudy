document.addEventListener("DOMContentLoaded", () => {
  const certSelect = document.getElementById("certSelect");
  const certNameInput = document.getElementById("certNameInput");
  const certIdInput = document.getElementById("certIdInput");
  const addCertBtn = document.getElementById("addCertBtn");
  const userEmail = document.getElementById("userEmail");

  userEmail.textContent = "Welcome, ricardoascencio3.14@gmail.com";

  const certifications = [
    { id: "az900", name: "Azure AZ-900" },
    { id: "fiori", name: "SAP Fiori" }
  ];

  function renderSelect() {
    // 🔥 limpiar opciones excepto placeholder
    certSelect.length = 1;

    certifications.forEach(cert => {
      const opt = document.createElement("option");
      opt.value = cert.id;
      opt.textContent = cert.name;
      certSelect.appendChild(opt);
    });

    M.FormSelect.init(certSelect);
  }

  renderSelect();

  addCertBtn.addEventListener("click", () => {
    const name = certNameInput.value.trim();
    if (!name) return;

    const id = certIdInput.value.trim() || name.toLowerCase().replace(/\s+/g, "-");

    certifications.push({ id, name });

    renderSelect();

    certNameInput.value = "";
    certIdInput.value = "";
  });
});