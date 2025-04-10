import { API_BASE_URL } from "../config.js";

console.log("🧠 Strategie-formulier geladen");

document.addEventListener("DOMContentLoaded", () => {
  loadSetupCheckboxes();

  const form = document.getElementById("strategieForm");
  form.addEventListener("submit", handleStrategieSubmit);
});

async function loadSetupCheckboxes() {
  const container = document.getElementById("setupCheckboxes");
  container.innerHTML = "⏳ Setups laden...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/setups`);
    const setups = await res.json();

    if (!Array.isArray(setups)) throw new Error("Setups niet gevonden");

    container.innerHTML = setups
      .map(setup => `
        <label style="display:block; margin-bottom:4px;">
          <input type="checkbox" name="setup_ids" value="${setup.id}" />
          ${setup.name}
        </label>
      `)
      .join("");
  } catch (err) {
    console.error("❌ Fout bij laden setups:", err);
    container.innerHTML = "❌ Fout bij laden van setups";
  }
}

async function handleStrategieSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const setupCheckboxes = form.querySelectorAll("input[name='setup_ids']:checked");
  const setup_ids = Array.from(setupCheckboxes).map(cb => parseInt(cb.value));

  const strategieNaam = document.getElementById("strategieNaam").value.trim();
  const botGebruik = document.getElementById("botGebruik").value === "true";
  const scoreDrempel = parseFloat(document.getElementById("scoreDrempel").value) || null;
  const notities = document.getElementById("strategieNotities").value.trim();

  if (!strategieNaam || setup_ids.length === 0) {
    alert("❗ Vul de strategie-naam in en selecteer minimaal 1 setup.");
    return;
  }

  const payload = {
    name: strategieNaam,
    setup_ids,
    bot_enabled: botGebruik,
    min_score: scoreDrempel,
    notes: notities,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/strategieën`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Strategie opslaan mislukt");

    alert("✅ Strategie succesvol opgeslagen!");
    form.reset();
    await loadSetupCheckboxes(); // reset ook de checkboxes
  } catch (err) {
    console.error("❌ Strategie toevoegen mislukt:", err);
    alert("❌ Opslaan mislukt. Zie console.");
  }
}
