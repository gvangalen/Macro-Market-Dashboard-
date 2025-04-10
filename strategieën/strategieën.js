// strategieën.js (uitgebreide versie met inline edit, favoriet, sortering, tooltip)
import { API_BASE_URL } from "../config.js";

console.log("📈 Strategieën module geladen!");

let strategieData = []; // cache voor sortering/filtering

// ✅ Event Listeners bij laden
document.addEventListener("DOMContentLoaded", async function () {
  const assetSelect = document.getElementById("assetFilter");
  const timeframeSelect = document.getElementById("timeframeFilter");
  const form = document.getElementById("strategieForm");
  const aiBtn = document.getElementById("genereerStrategieënBtn");
  const sortDropdown = document.getElementById("sortSelect");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);
  if (form) form.addEventListener("submit", handleStrategieSubmit);
  if (aiBtn) aiBtn.addEventListener("click", handleStrategieGeneratie);
  if (sortDropdown) sortDropdown.addEventListener("change", renderStrategieen);

  await fetchStrategieen();
  await loadSetupCheckboxes();
});

// ✅ Strategieën ophalen
async function fetchStrategieen() {
  const asset = document.getElementById("assetFilter").value;
  const timeframe = document.getElementById("timeframeFilter").value;
  const container = document.getElementById("strategieLijst");
  container.innerHTML = "<p>🔄 Strategieën laden...</p>";

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën?asset=${asset}&timeframe=${timeframe}`);
    if (!res.ok) throw new Error("Strategie data niet beschikbaar");
    const data = await res.json();
    strategieData = data.strategieën || [];
    renderStrategieen();
  } catch (err) {
    console.error("❌ Fout bij laden strategieën:", err);
    container.innerHTML = `<p style='color:red;'>❌ Fout bij ophalen van strategieën.</p>`;
  }
}

// ✅ Strategieën renderen
function renderStrategieen() {
  const sort = document.getElementById("sortSelect")?.value;
  let data = [...strategieData];
  if (sort === "score") data.sort((a, b) => (b.score || 0) - (a.score || 0));
  else if (sort === "favoriet") data.sort((a, b) => (b.favoriet === true) - (a.favoriet === true));
  else data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const html = data.map(s => renderStrategieKaart(s)).join("\n");
  document.getElementById("strategieLijst").innerHTML = html;
}

// ✅ Render één kaart
function renderStrategieKaart(s) {
  const favorietSter = s.favoriet ? "⭐️" : "☆";
  const uitleg = s.explanation || "Geen uitleg beschikbaar";
  const tooltip = s.explanation_reason || "Gebaseerd op technische en macro-analyse";

  return `
    <div class="strategie-kaart" data-id="${s.id}">
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 12px;">
        <strong>${s.name || "Strategie"}</strong>
        <span class="favoriet-toggle" title="Toggle favoriet" style="cursor:pointer;">${favorietSter}</span>
      </div>
      <table>
        <tr><th>📋 Setup</th><td>${s.setup_name || "–"}</td></tr>
        <tr><th>⏱️ TF</th><td>${s.asset || "BTC"} (${s.timeframe || "1D"})</td></tr>
        <tr><th>⭐️ Score</th><td><input value="${s.score || ""}" data-field="score" /></td></tr>
        <tr><th>🎯 Entry</th><td><input value="${s.entry || ""}" data-field="entry" /></td></tr>
        <tr><th>🎯 Targets</th><td><input value="${(s.targets || []).join(", ")}" data-field="targets" /></td></tr>
        <tr><th>🛑 Stop-Loss</th><td><input value="${s.stop_loss || ""}" data-field="stop_loss" /></td></tr>
        <tr><th>📊 R:R</th><td><input value="${s.risk_reward || ""}" data-field="risk_reward" /></td></tr>
        <tr><th>🧠 Uitleg <span title="${tooltip}" style="cursor:help;">🛈</span></th>
            <td><textarea data-field="explanation">${uitleg}</textarea></td></tr>
        <tr><td colspan="2" style="text-align:right;">
          <button class="opslaan-btn">💾 Opslaan</button>
          <button class="verwijder-btn">🗑️</button>
          <button class="hergenereer-btn">🔁 Genereer opnieuw (AI)</button>
        </td></tr>
      </table>
    </div>
  `;
}

// ✅ Inline bewerken en actieknoppen

document.addEventListener("click", async function (e) {
  const kaart = e.target.closest(".strategie-kaart");
  const id = kaart?.dataset?.id;

  // Favoriet toggle
  if (e.target.classList.contains("favoriet-toggle")) {
    const isFavoriet = e.target.textContent === "⭐️";
    await updateStrategie(id, { favoriet: !isFavoriet });
    await fetchStrategieen();
  }

  // Opslaan
  if (e.target.classList.contains("opslaan-btn")) {
    const inputs = kaart.querySelectorAll("[data-field]");
    const payload = {};
    inputs.forEach(inp => {
      const key = inp.dataset.field;
      payload[key] = key === "targets" ? inp.value.split(",").map(v => v.trim()) : inp.value;
    });
    await updateStrategie(id, payload);
    await fetchStrategieen();
  }

  // Verwijderen
  if (e.target.classList.contains("verwijder-btn")) {
    if (confirm("Weet je zeker dat je deze strategie wilt verwijderen?")) {
      await fetch(`${API_BASE_URL}/strategieën/${id}`, { method: "DELETE" });
      await fetchStrategieen();
    }
  }

  // Hergenereer AI-strategie
  if (e.target.classList.contains("hergenereer-btn")) {
    const confirmOverwrite = confirm("Overschrijven of apart opslaan?\nKlik OK voor overschrijven, Annuleer voor nieuwe strategie.");
    const action = confirmOverwrite ? "overwrite" : "nieuw";
    const res = await fetch(`${API_BASE_URL}/strategie/generate/${id}?action=${action}`, { method: "POST" });
    const data = await res.json();
    alert(data.message || "AI-strategie gegenereerd");
    await fetchStrategieen();
  }
});

// ✅ PUT call naar backend
async function updateStrategie(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/strategieën/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update mislukt");
    console.log("✅ Strategie geüpdatet");
  } catch (err) {
    console.error("❌ Fout bij bijwerken strategie:", err);
  }
}
