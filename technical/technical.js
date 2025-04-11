import { API_BASE_URL } from "../config.js";

console.log("✅ technical.js geladen!");

const baseUrl = `${API_BASE_URL}/technical_data`;
let currentSortField = "symbol";
let currentSortOrder = "asc";

document.addEventListener("DOMContentLoaded", () => {
  loadTechAnalysis();
  setInterval(loadTechAnalysis, 60000); // 🔄 Elke minuut updaten

  // Sorteren via kolomtitel
  document.querySelectorAll("#analysisTable thead th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (currentSortField === field) {
        currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
      } else {
        currentSortField = field;
        currentSortOrder = "asc";
      }
      loadTechAnalysis(); // herlaadt met sortering
    });
  });
});

async function loadTechAnalysis() {
  setText("techStatus", "📡 Laden...");
  const timeframe = document.getElementById("globalTimeframe")?.value || "4hr";

  try {
    const data = await safeFetch(`${baseUrl}?timeframe=${timeframe}`);
    if (!Array.isArray(data)) throw new Error("Ongeldige API-response");

    renderTechTable(data);
    setText("techStatus", "✅ Data up-to-date");
  } catch (err) {
    showError("techStatus", "❌ Fout bij laden.");
    console.error(err);
  }
}

function renderTechTable(assets) {
  const tbody = document.querySelector("#analysisTable tbody");
  tbody.innerHTML = "";

  // Sorteerdata
  assets.sort((a, b) => {
    const valA = a[currentSortField];
    const valB = b[currentSortField];
    return currentSortOrder === "asc"
      ? valA > valB ? 1 : -1
      : valA < valB ? 1 : -1;
  });

  let totalScore = 0;

  for (const asset of assets) {
    const row = document.createElement("tr");
    row.dataset.id = asset.id;

    const score = calculateTechScore(asset);
    totalScore += score;

    const trend = score >= 1 ? "Bullish 📈" : score <= -1 ? "Bearish 📉" : "Neutraal ⚖️";
    const scoreClass = score >= 1 ? "score-positive" : score <= -1 ? "score-negative" : "score-neutral";

    row.innerHTML = `
      <td>${asset.symbol}</td>
      <td>${asset.rsi?.toFixed(1) || "-"}</td>
      <td>${formatNumber(asset.volume)}</td>
      <td>${formatNumber(asset.ma_200)}</td>
      <td class="${scoreClass}" title="Op basis van RSI, volume en MA">${score}</td>
      <td class="trend-cell" title="Samengestelde interpretatie">${trend}</td>
      <td><button class="btn-remove">❌</button></td>
    `;

    tbody.appendChild(row);
  }

  updateScoreSummary(totalScore, assets.length);
  attachDeleteEventListeners();
}

function calculateTechScore(asset) {
  let score = 0;
  if (asset.rsi > 70) score -= 2;
  else if (asset.rsi > 55) score -= 1;
  else if (asset.rsi < 30) score += 2;
  else if (asset.rsi < 45) score += 1;

  if (asset.volume > 1_000_000_000) score += 1;
  if (asset.ma_200 < asset.price) score += 1;
  else score -= 1;

  return Math.max(-2, Math.min(2, score));
}

function updateScoreSummary(total, count) {
  const avg = count > 0 ? (total / count).toFixed(1) : "N/A";
  document.getElementById("totalTechScore").innerText = avg;

  let advies = "⚖️ Neutraal";
  if (avg >= 1.5) advies = "🟢 Bullish";
  else if (avg <= -1.5) advies = "🔴 Bearish";

  document.getElementById("technicalAdvice").innerText = advies;
}

// Herbruikbare functies
async function removeTechRow(assetId) {
  if (!confirm("Weet je zeker dat je deze asset wilt verwijderen?")) return;
  await safeFetch(`${baseUrl}/${assetId}`, "DELETE");
  loadTechAnalysis();
}

function attachDeleteEventListeners() {
  document.querySelectorAll(".btn-remove").forEach(btn => {
    btn.removeEventListener("click", handleDeleteClick);
    btn.addEventListener("click", handleDeleteClick);
  });
}

function handleDeleteClick(e) {
  const assetId = e.target.closest("tr").dataset.id;
  if (assetId) removeTechRow(assetId);
}

async function safeFetch(url, method = "GET", body = null) {
  let retries = 3;
  while (retries > 0) {
    try {
      const options = { method, headers: { "Content-Type": "application/json" } };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`Serverfout (${res.status})`);
      return method === "GET" ? await res.json() : true;
    } catch (err) {
      console.warn(`⏳ Retry (${retries}) bij: ${url}`);
      retries--;
      await new Promise(res => setTimeout(res, 1500));
    }
  }
  throw new Error("❌ Alle retries mislukt!");
}

function formatNumber(num) {
  return num >= 1e9 ? (num / 1e9).toFixed(1) + "B"
       : num >= 1e6 ? (num / 1e6).toFixed(1) + "M"
       : num.toFixed(1);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.color = "red";
  }
}
