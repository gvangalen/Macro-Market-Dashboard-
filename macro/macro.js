import { API_BASE_URL } from "../config.js";

console.log("✅ macro.js correct geladen!");

let macroData = [];

document.addEventListener("DOMContentLoaded", function () {
  console.log("📌 Macro Indicatoren geladen!");
  updateMacroData();
  setInterval(updateMacroData, 60000);

  const headers = document.querySelectorAll("#macroTable thead th.sortable");
  headers.forEach(header => {
    header.addEventListener("click", () => sortMacroTable(header.dataset.key));
  });
});

async function safeFetch(url) {
  let retries = 3;
  while (retries > 0) {
    try {
      let response = await fetch(`${API_BASE_URL}${url}`);
      if (!response.ok) throw new Error(`Fout bij ophalen van ${url}`);
      const data = await response.json();
      if (!data || Object.keys(data).length === 0) throw new Error("Lege response");
      return data;
    } catch (err) {
      console.error("❌ safeFetch:", err);
      retries--;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function updateMacroData() {
  const dashboard = await safeFetch("/api/dashboard_data");
  if (!dashboard || !dashboard.macro_data) return console.warn("⚠️ Geen macrodata ontvangen");

  macroData = dashboard.macro_data;
  renderMacroTable(macroData);
  markStepDone(3);
}

function renderMacroTable(data) {
  const tbody = document.querySelector("#macroTable tbody");
  tbody.innerHTML = "";

  let totalScore = 0;
  let count = 0;

  data.forEach(ind => {
    const score = calculateMacroScore(ind.name, parseFloat(ind.value));
    if (!isNaN(score)) {
      totalScore += score;
      count++;
    }

    const tooltip = getIndicatorExplanation(ind.name);
    const scoreColor = score >= 2 ? "score-high" : score <= -2 ? "score-low" : "score-mid";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ind.name}</td>
      <td class="tooltip" data-tooltip="${tooltip}">${ind.value}</td>
      <td>${ind.trend || "–"}</td>
      <td>${ind.interpretation || "–"}</td>
      <td>${ind.action || "–"}</td>
      <td class="macro-score ${scoreColor}">${score}</td>
      <td><button onclick="removeRow(this)">❌</button></td>
    `;
    tbody.appendChild(row);
  });

  const avg = count ? (totalScore / count).toFixed(1) : "N/A";
  document.getElementById("macroTotalScore").innerText = avg;
  document.getElementById("macroAdvice").innerText = getMacroAdvice(avg);
}

function calculateMacroScore(indicator, value) {
  if (indicator === "fear_greed_index") {
    return value > 75 ? 2 : value > 55 ? 1 : value < 30 ? -2 : value < 45 ? -1 : 0;
  }
  if (indicator === "btc_dominance") {
    return value > 55 ? 2 : value > 50 ? 1 : value < 45 ? -2 : value < 48 ? -1 : 0;
  }
  if (indicator === "dxy") {
    return value < 100 ? 2 : value < 103 ? 1 : value > 107 ? -2 : value > 104 ? -1 : 0;
  }
  return 0;
}

function getMacroAdvice(score) {
  if (score >= 1.5) return "🟢 Bullish";
  if (score <= -1.5) return "🔴 Bearish";
  return "⚖️ Neutraal";
}

function sortMacroTable(key) {
  macroData.sort((a, b) => {
    const aVal = parseFloat(a[key]);
    const bVal = parseFloat(b[key]);
    return isNaN(aVal) || isNaN(bVal) ? 0 : bVal - aVal;
  });
  renderMacroTable(macroData);
}

function getIndicatorExplanation(indicator) {
  const uitleg = {
    fear_greed_index: "Gebaseerd op marktgevoelens van angst tot hebzucht. Lage waarde = angst, hoge waarde = hebzucht.",
    btc_dominance: "Hogere dominantie = minder altcoin-risico. Lagere dominantie = risicobereidheid stijgt.",
    dxy: "DXY = sterkte van de dollar. Lagere waarde = gunstig voor crypto en risicovolle assets."
  };
  return uitleg[indicator] || "Geen uitleg beschikbaar";
}

// ✅ Rijen handmatig verwijderen (voor demo/test)
function removeRow(btn) {
  const row = btn.closest("tr");
  if (row) row.remove();
  updateMacroScore();
}

function updateMacroScore() {
  const scores = document.querySelectorAll(".macro-score");
  let total = 0;
  let count = 0;
  scores.forEach(cell => {
    const val = parseFloat(cell.innerText);
    if (!isNaN(val)) {
      total += val;
      count++;
    }
  });

  const avg = count ? (total / count).toFixed(1) : "N/A";
  document.getElementById("macroTotalScore").innerText = avg;
  document.getElementById("macroAdvice").innerText = getMacroAdvice(avg);
}

// ✅ Onboarding stap markeren
function markStepDone(step) {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  fetch(`${API_BASE_URL}/api/onboarding_progress/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step })
  }).then(res => {
    if (!res.ok) console.warn(`⚠️ Kon stap ${step} niet markeren`);
  });
}
