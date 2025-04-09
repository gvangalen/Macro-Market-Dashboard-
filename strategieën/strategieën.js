// strategieën.js
import { API_BASE_URL } from "../config.js";

console.log("📈 Strategieën module geladen!");

document.addEventListener("DOMContentLoaded", async function () {
  const assetSelect = document.getElementById("assetFilter");
  const timeframeSelect = document.getElementById("timeframeFilter");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);

  await fetchStrategieen();
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

    const html = data.strategieën.map(s => renderStrategieBlock(s)).join("\n");
    container.innerHTML = html;

  } catch (err) {
    console.error("❌ Fout bij laden strategieën:", err);
    container.innerHTML = `<p style='color:red;'>❌ Fout bij ophalen van strategieën.</p>`;
  }
}

function renderStrategieBlock(s) {
  const label = s.type || "Swingstrategie";
  const score = s.score != null ? `⭐️ ${s.score}/10` : "";
  const entry = s.entry || "?";
  const targets = s.targets?.join(", ") || "?";
  const sl = s.stop_loss || "?";
  const setup = s.setup_name || "Onbekend";
  const explanation = s.explanation || "Geen uitleg beschikbaar.";

  return `
    <div class="strategie-card">
      <div class="strategie-header">
        <strong>${label} – ${s.asset} (${s.timeframe})</strong>
        <span class="strategie-score">${score}</span>
      </div>
      <div class="strategie-body">
        <p><strong>🎯 Entry:</strong> ${entry}</p>
        <p><strong>📈 Targets:</strong> ${targets}</p>
        <p><strong>🛡️ Stop-loss:</strong> ${sl}</p>
        <p><strong>📋 Setup:</strong> ${setup}</p>
        <p class="strategie-explanation">${explanation}</p>
      </div>
    </div>
  `;
}
