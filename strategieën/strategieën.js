// strategieën.js
import { API_BASE_URL } from "../config.js";

console.log("📈 Strategieën module geladen!");

document.addEventListener("DOMContentLoaded", async function () {
  const assetSelect = document.getElementById("filterAsset");
  const timeframeSelect = document.getElementById("filterTimeframe");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);

  await fetchStrategieen();
});

async function fetchStrategieen() {
  const asset = document.getElementById("filterAsset").value;
  const timeframe = document.getElementById("filterTimeframe").value;
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
  const label = s.type || "Swingstrategie";
  const score = s.score != null ? `${s.score}/10` : "-";
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
        <tr>
          <th>🎯 Strategie</th>
          <td><strong>${label}</strong> – ${asset} (${timeframe})</td>
        </tr>
        <tr>
          <th>⭐️ Score</th>
          <td>${score}</td>
        </tr>
        <tr>
          <th>📋 Setup</th>
          <td>${setup}</td>
        </tr>
        <tr>
          <th>🎯 Entry</th>
          <td>${entry}</td>
        </tr>
        <tr>
          <th>🎯 Targets</th>
          <td>${targets}</td>
        </tr>
        <tr>
          <th>🛡️ Stop-Loss</th>
          <td>${stopLoss}</td>
        </tr>
        <tr>
          <th>📊 R:R Ratio</th>
          <td>${rr}</td>
        </tr>
        <tr>
          <th>🧠 Uitleg</th>
          <td>${explanation}</td>
        </tr>
      </table>
    </div>
  `;
}
