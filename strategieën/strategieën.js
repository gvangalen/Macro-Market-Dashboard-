// strategieën.js
import { API_BASE_URL } from "../config.js";

console.log("📈 Strategieën module geladen!");

document.addEventListener("DOMContentLoaded", async function () {
  const assetSelect = document.getElementById("assetFilter");
  const timeframeSelect = document.getElementById("timeframeFilter");
  const form = document.getElementById("strategieForm");
  const aiBtn = document.getElementById("genereerStrategieënBtn");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);

  if (form) form.addEventListener("submit", handleStrategieSubmit);
  if (aiBtn) aiBtn.addEventListener("click", handleStrategieGeneratie);

  await fetchStrategieen();
  await loadSetupCheckboxes();
});

async function fetchStrategieen() {
  const asset = document.getElementById("assetFilter").value;
  const timeframe = document.getElementById("timeframeFilter").value;
  const container = document.getElementById("strategieLijst");

  container.innerHTML = "<p>🔄 Strategieën laden...</p>";

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën?asset=${asset}&timeframe=${timeframe}`);
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

async function handleStrategieSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const name = form.strategieNaam.value.trim();
  const notes = form.strategieNotities.value.trim();
  const bot_enabled = form.botGebruik.value === "true";
  const min_score = parseFloat(form.scoreDrempel.value) || null;

  const setupCheckboxes = document.querySelectorAll("input[name='active_setups[]']:checked");
  const setups = Array.from(setupCheckboxes).map(cb => cb.value);

  const payload = {
    name,
    notes,
    bot_enabled,
    min_score,
    setup_ids: setups
  };

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Fout bij opslaan strategie");
    alert("✅ Strategie toegevoegd!");
    form.reset();
    await fetchStrategieen();
  } catch (err) {
    console.error("❌ Strategie toevoegen mislukt:", err);
    alert("❌ Strategie opslaan mislukt");
  }
}

async function loadSetupCheckboxes() {
  const container = document.getElementById("setupCheckboxes");
  if (!container) return;

  container.innerHTML = "⏳ Laden...";
  try {
    const res = await fetch(`${API_BASE_URL}/setups`);
    const data = await res.json();
    if (!Array.isArray(data.setups)) throw new Error("Geen setups gevonden");
    container.innerHTML = data.setups.map(setup => `
      <label style="display:block; margin-bottom:4px;">
        <input type="checkbox" name="active_setups[]" value="${setup.id}" />
        ${setup.name}
      </label>
    `).join("");
  } catch (err) {
    container.innerHTML = "❌ Fout bij laden setups";
    console.error(err);
  }
}

async function handleStrategieGeneratie() {
  const statusP = document.getElementById("genereerStatus");
  statusP.textContent = "⏳ Strategieën worden gegenereerd...";
  try {
    const res = await fetch(`${API_BASE_URL}/strategie/generate_all`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.task_id) {
      statusP.textContent = "✅ AI-strategiegeneratie gestart... (ID: " + data.task_id + ")";
      setTimeout(() => checkStrategieTaskStatus(data.task_id), 5000);
    } else {
      statusP.textContent = "⚠️ Fout: " + (data.error || "Onbekende fout");
    }
  } catch (err) {
    console.error(err);
    statusP.textContent = "❌ Fout bij starten van AI-strategiegeneratie";
  }
}

async function checkStrategieTaskStatus(taskId) {
  const statusP = document.getElementById("genereerStatus");
  try {
    const res = await fetch(`${API_BASE_URL}/task_status/${taskId}`);
    const data = await res.json();
    if (data.status === "SUCCESS") {
      statusP.textContent = "✅ Strategieën succesvol gegenereerd!";
      await fetchStrategieen();
    } else if (data.status === "FAILURE") {
      statusP.textContent = "❌ Fout tijdens generatie";
    } else {
      statusP.textContent = `⌛ Status: ${data.status}... (ID: ${taskId})`;
      setTimeout(() => checkStrategieTaskStatus(taskId), 3000);
    }
  } catch (err) {
    statusP.textContent = "⚠️ Kan status niet ophalen";
    console.error(err);
  }
}
