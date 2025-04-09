// strategieën.js
import { API_BASE_URL } from "../config.js";

console.log("📈 Strategieën module geladen!");

document.addEventListener("DOMContentLoaded", async function () {
  const assetSelect = document.getElementById("assetFilter");
  const timeframeSelect = document.getElementById("timeframeFilter");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);

  await fetchStrategieen();
  await loadSetupCheckboxes();

  document.getElementById("strategieForm").addEventListener("submit", handleStrategieSubmit);
});

async function fetchStrategieen() {
  const asset = document.getElementById("assetFilter").value;
  const timeframe = document.getElementById("timeframeFilter").value;
  const container = document.getElementById("strategieLijst");

  container.innerHTML = "<p>🔄 Strategieën laden...</p>";

  try {
    const res = await fetch(`${API_BASE_URL}/api/strategieën?asset=${asset}&timeframe=${timeframe}`);
    if (!res.ok) throw new Error("Strategie data niet beschikbaar");
    const data = await res.json();

    if (!data || !Array.isArray(data.strategieën) || data.strategieën.length === 0) {
      container.innerHTML = "<p>⚠️ Geen strategieën gevonden voor deze selectie.</p>";
      return;
    }

    const html = data.strategieën.map(s => renderStrategieKaart(s)).join("\n");
    container.innerHTML = html;

  } catch (err) {
    console.error("❌ Fout bij laden strategieën:", err);
    container.innerHTML = `<p style='color:red;'>❌ Fout bij ophalen van strategieën.</p>`;
  }
}

function renderStrategieKaart(s) {
  const label = s.name || "Swingstrategie";
  const score = s.score != null ? `${s.score}/10` : "–";
  const entry = s.entry || "–";
  const targets = s.targets?.join(", ") || "–";
  const stopLoss = s.stop_loss || "–";
  const rr = s.risk_reward || "–";
  const setup = s.setup_name || "–";
  const explanation = s.explanation || "Geen uitleg beschikbaar.";
  const asset = s.asset || "BTC";
  const timeframe = s.timeframe || "1D";

  return `
    <div class="strategie-kaart">
      <table>
        <tr><th>🎯 Strategie</th><td><strong>${label}</strong> – ${asset} (${timeframe})</td></tr>
        <tr><th>⭐️ Score</th><td>${score}</td></tr>
        <tr><th>📋 Setup</th><td>${setup}</td></tr>
        <tr><th>🎯 Entry</th><td>${entry}</td></tr>
        <tr><th>🎯 Targets</th><td>${targets}</td></tr>
        <tr><th>🛡️ Stop-Loss</th><td>${stopLoss}</td></tr>
        <tr><th>📊 R:R Ratio</th><td>${rr}</td></tr>
        <tr><th>🧠 Uitleg</th><td>${explanation}</td></tr>
      </table>
    </div>
  `;
}

// ✅ Laad setup-checkboxes
async function loadSetupCheckboxes() {
  const container = document.getElementById("setupCheckboxes");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/setups`);
    const data = await res.json();
    if (!Array.isArray(data.setups)) throw new Error("Setups niet gevonden");

    container.innerHTML = data.setups.map(setup => `
      <label><input type="checkbox" name="setupIds" value="${setup.id}" /> ${setup.name}</label>
    `).join("<br>");

  } catch (err) {
    console.error("❌ Fout bij ophalen van setups:", err);
    container.innerHTML = "<p style='color:red;'>❌ Fout bij ophalen van setups.</p>";
  }
}

// ✅ Formulierverwerking
async function handleStrategieSubmit(e) {
  e.preventDefault();
  const naam = document.getElementById("strategieNaam").value;
  const bot = document.getElementById("botGebruik").value === "true";
  const drempel = document.getElementById("scoreDrempel").value;
  const notities = document.getElementById("strategieNotities").value;

  const setupIds = Array.from(document.querySelectorAll("input[name='setupIds']:checked")).map(cb => cb.value);

  if (!naam || setupIds.length === 0) {
    alert("Naam en minimaal 1 gekoppelde setup zijn verplicht.");
    return;
  }

  const payload = {
    name: naam,
    setup_ids: setupIds,
    use_bot: bot,
    score_threshold: drempel ? parseFloat(drempel) : null,
    notes: notities
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/strategieën`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Strategie toevoegen mislukt");

    alert("✅ Strategie succesvol toegevoegd!");
    document.getElementById("strategieForm").reset();
    await fetchStrategieen();
  } catch (err) {
    console.error("❌ Strategie opslaan mislukt:", err);
    alert("❌ Er ging iets mis bij het opslaan van de strategie.");
  }
}
