// strategieën.js
import { API_BASE_URL } from "../config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const assetSelect = document.getElementById("assetFilter");
  const timeframeSelect = document.getElementById("timeframeFilter");
  const form = document.getElementById("strategieForm");

  assetSelect.addEventListener("change", fetchStrategieen);
  timeframeSelect.addEventListener("change", fetchStrategieen);
  if (form) form.addEventListener("submit", handleStrategieSubmit);

  await fetchStrategieen();
  await loadSetupCheckboxes();
});

async function fetchStrategieen() {
  const asset = document.getElementById("assetFilter").value;
  const timeframe = document.getElementById("timeframeFilter").value;
  const container = document.getElementById("strategieLijst");

  container.innerHTML = "⏳ Strategieën laden...";

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën?asset=${asset}&timeframe=${timeframe}`);
    const data = await res.json();
    if (!Array.isArray(data.strategieën)) throw new Error("Data fout");

    container.innerHTML = data.strategieën.map(renderStrategieKaart).join("");
  } catch (err) {
    container.innerHTML = "❌ Fout bij ophalen van strategieën.";
    console.error(err);
  }
}

function renderStrategieKaart(s) {
  const score = s.score != null ? `${s.score}/10` : "–";
  const rr = s.risk_reward || "–";
  const targets = s.targets?.join(", ") || "–";
  const favorite = s.favorite ? "⭐️" : "";
  const autoLabel = s.type === "auto" ? "🤖 Auto" : "📝 Handmatig";

  return `
    <div class="strategie-kaart" data-id="${s.id}">
      <table>
        <tr><th>📌 Naam</th><td>${favorite} ${s.setup_name || "Zonder naam"} (${s.asset}/${s.timeframe})</td></tr>
        <tr><th>⭐️ Score</th><td>${score}</td></tr>
        <tr><th>🎯 Entry</th><td>${s.entry || "–"}</td></tr>
        <tr><th>🎯 Targets</th><td>${targets}</td></tr>
        <tr><th>🛡️ Stop-loss</th><td>${s.stop_loss || "–"}</td></tr>
        <tr><th>📊 R:R</th><td>${rr}</td></tr>
        <tr><th>🧠 Uitleg</th><td>${s.explanation || "Geen analyse"}</td></tr>
        <tr><th>📄 Type</th><td>${autoLabel}</td></tr>
        <tr><td colspan="2" style="text-align: center; padding-top: 10px;">
          <button onclick="hergenereerStrategie(${s.id})">🔁 Genereer opnieuw</button>
          <button onclick="verwijderStrategie(${s.id})">🗑️ Verwijderen</button>
          <button onclick="bewerkStrategie(${s.id})">✏️ Bewerken</button>
        </td></tr>
      </table>
    </div>
  `;
}

window.hergenereerStrategie = async function (id) {
  const confirm = window.confirm("Wil je deze strategie overschrijven met een nieuwe AI-versie?");
  if (!confirm) return;

  try {
    const res = await fetch(`${API_BASE_URL}/strategie/generate/${id}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Strategie opnieuw gegenereerd!");
      fetchStrategieen();
    } else {
      alert("❌ Fout: " + (data.error || "Onbekend"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Genereren mislukt.");
  }
};

window.verwijderStrategie = async function (id) {
  if (!confirm("Weet je zeker dat je deze strategie wilt verwijderen?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("🗑️ Verwijderd");
      fetchStrategieen();
    } else {
      alert("❌ Verwijderen mislukt");
    }
  } catch (err) {
    console.error(err);
  }
};

window.bewerkStrategie = async function (id) {
  const kaart = document.querySelector(`.strategie-kaart[data-id="${id}"]`);
  const explanation = prompt("📝 Update de uitleg voor deze strategie:");
  if (!explanation) return;

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ explanation })
    });
    if (res.ok) {
      alert("✏️ Strategie bijgewerkt!");
      fetchStrategieen();
    } else {
      alert("❌ Bewerken mislukt");
    }
  } catch (err) {
    console.error(err);
  }
};

async function handleStrategieSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const payload = {
    setup_name: form.strategieNaam.value,
    type: "manual",
    explanation: form.strategieNotities.value,
    asset: "BTC",
    timeframe: "1D",
    score: null,
    entry: null,
    targets: [],
    stop_loss: null,
    risk_reward: null
  };

  try {
    const res = await fetch(`${API_BASE_URL}/strategieën`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("✅ Strategie toegevoegd!");
      form.reset();
      fetchStrategieen();
    } else {
      throw new Error("Opslaan mislukt");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Strategie opslaan mislukt");
  }
}

async function loadSetupCheckboxes() {
  const container = document.getElementById("setupCheckboxes");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/setups`);
    const data = await res.json();
    container.innerHTML = data.map(s => `
      <label><input type="checkbox" name="active_setups[]" value="${s.id}" /> ${s.name}</label>
    `).join("<br>");
  } catch (err) {
    console.error(err);
    container.innerHTML = "⚠️ Setups laden mislukt";
  }
}
