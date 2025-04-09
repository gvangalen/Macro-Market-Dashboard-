import { API_BASE_URL } from "../config.js";
console.log("✅ gauges.js correct geladen!");

let macroGauge, technicalGauge, setupGauge;

document.addEventListener("DOMContentLoaded", function () {
  const createGauge = (ctx) => new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"],
      datasets: [{
        data: [20, 20, 20, 20, 20],
        backgroundColor: ["#ff3b30", "#ff9500", "#f0ad4e", "#4cd964", "#34c759"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: "80%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });

  macroGauge = createGauge(document.getElementById("macroGauge"));
  technicalGauge = createGauge(document.getElementById("technicalGauge"));
  setupGauge = createGauge(document.getElementById("setupGauge"));

  fetchGaugeData();
  setInterval(fetchGaugeData, 60000); // Elke minuut verversen
});

const SCORE_LABELS = ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"];
const EXPLANATION_MAP = {
  "-2": "📉 Negatief signaal op meerdere indicatoren.",
  "-1": "⚠️ Licht bearish sentiment.",
  "0": "😐 Neutraal: markt is in balans.",
  "1": "📈 Voorzichtig positief momentum.",
  "2": "🚀 Sterk positief signaal!"
};

// ✅ Ophalen en tonen van gauges
async function fetchGaugeData() {
  try {
    const macro = await fetchScore("/api/score/macro");
    const tech = await fetchScore("/api/score/technical");
    const setup = await fetchScore("/api/score/setup");

    setGaugeWithText(macroGauge, macro.total_score, "macroExplanation", macro.scores, "macroScore", "macroLog");
    setGaugeWithText(technicalGauge, tech.total_score, "technicalExplanation", tech.scores, "technicalScore", "technicalLog");

    const best = findBestSetup(setup.setups);
    if (best) {
      setGaugeWithBestSetup(setupGauge, best, "setupExplanation", "setupScore", "setupLog");
      showTopSetupsMini(setup.setups);
    }

  } catch (err) {
    console.error("❌ Fout bij ophalen van scores:", err);
  }
}

async function fetchScore(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Fout bij ophalen van ${path}`);
  return await res.json();
}

// ✅ Macro & Technisch: Toon score, uitleg, log
function setGaugeWithText(gauge, score, explanationId, indicators = {}, scoreId, logId) {
  const labelIndex = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
  const label = SCORE_LABELS[labelIndex];
  const explanation = EXPLANATION_MAP[score?.toString()] || "Geen uitleg.";

  if (gauge) {
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((_, i) => i === labelIndex ? 100 : 20);
    gauge.update();
  }

  const scoreEl = document.getElementById(scoreId);
  if (scoreEl) scoreEl.textContent = `Score: ${score}`;

  const explanationDiv = document.getElementById(explanationId);
  if (explanationDiv) {
    explanationDiv.innerHTML = `
      <div style="text-align:center; margin-top: 8px;">
        <strong style="font-size: 1.1rem;">${label}</strong><br />
        <span style="font-size: 0.9rem; color: #666;">${explanation}</span>
      </div>
    `;
  }

  const logDiv = document.getElementById(logId);
  if (logDiv && indicators && Object.keys(indicators).length > 0) {
    logDiv.innerHTML = `<ul>`;
    for (const [key, val] of Object.entries(indicators)) {
      const value = val?.value ?? "-";
      const score = val?.score ?? "-";
      logDiv.innerHTML += `<li><strong>${key}</strong>: ${value} → <code>score ${score}</code></li>`;
    }
    logDiv.innerHTML += `</ul>`;
  }
}

// ✅ Beste setup tonen in meter
function setGaugeWithBestSetup(gauge, setup, explanationId, scoreId, logId) {
  const score = setup.score ?? 0;
  const labelIndex = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
  const label = SCORE_LABELS[labelIndex];
  const explanation = setup.explanation || "Geen uitleg.";
  const name = setup.name || "Onbekende setup";

  if (gauge) {
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((_, i) => i === labelIndex ? 100 : 20);
    gauge.update();
  }

  const scoreEl = document.getElementById(scoreId);
  if (scoreEl) scoreEl.textContent = `Score: ${score}`;

  const explanationDiv = document.getElementById(explanationId);
  if (explanationDiv) {
    explanationDiv.innerHTML = `
      <div style="text-align:center; margin-top: 8px;">
        <strong style="font-size: 1.1rem;">⭐️ ${name}</strong><br />
        <span style="font-size: 1rem; font-weight:bold;">${label} (${score})</span><br />
        <span style="font-size: 0.9rem; color: #666;">${explanation}</span><br />
        <button onclick="window.showSetupInspector()" style="margin-top: 8px;">🔎 Bekijk alle setups</button>
      </div>
    `;
  }

  const logDiv = document.getElementById(logId);
  if (logDiv && setup.indicators) {
    logDiv.innerHTML = `<ul>`;
    for (const [key, val] of Object.entries(setup.indicators)) {
      const value = val?.value ?? "-";
      const score = val?.score ?? "-";
      logDiv.innerHTML += `<li><strong>${key}</strong>: ${value} → <code>score ${score}</code></li>`;
    }
    logDiv.innerHTML += `</ul>`;
  }
}

// ✅ Top 3 mini-overzicht
function showTopSetupsMini(setups) {
  const top = setups
    .filter(s => typeof s.score === "number")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const mini = document.getElementById("topSetupsMini");
  if (!mini) return;

  mini.innerHTML = `<strong>Top 3 setups</strong><ul style="padding-left: 16px;">` +
    top.map(s => `<li>⭐️ <strong>${s.name}</strong> → <code>${s.score}</code></li>`).join("") +
    `</ul>`;
}

// ✅ Helper
function findBestSetup(setups) {
  if (!Array.isArray(setups)) return null;
  return setups.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
}
