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
  setInterval(fetchGaugeData, 60000); // elke minuut
});

const SCORE_LABELS = ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"];
const EXPLANATION_MAP = {
  "-2": "📉 Negatief signaal op meerdere indicatoren.",
  "-1": "⚠️ Licht bearish sentiment.",
  "0": "😐 Neutraal: markt is in balans.",
  "1": "📈 Voorzichtig positief momentum.",
  "2": "🚀 Sterk positief signaal!"
};

// 🔁 Gauges vullen op basis van API-score
async function fetchGaugeData() {
  try {
    const macro = await fetchScore("/api/score/macro");
    const tech = await fetchScore("/api/score/technical");
    const setup = await fetchScore("/api/score/setup");

    setGaugeWithText(macroGauge, macro.total_score, "macroExplanation", macro.scores);
    setGaugeWithText(technicalGauge, tech.total_score, "technicalExplanation", tech.scores);

    // Beste setup selecteren
    const best = findBestSetup(setup.setups);
    if (best) {
      setGaugeWithBestSetup(setupGauge, best, "setupExplanation");
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

// ✅ Macro & Technisch – gemiddelden
function setGaugeWithText(gauge, score, explanationId, indicators = {}) {
  const labelIndex = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
  const label = SCORE_LABELS[labelIndex];
  const explanation = EXPLANATION_MAP[score?.toString()] || "Geen uitleg.";

  if (gauge) {
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((_, i) => i === labelIndex ? 100 : 20);
    gauge.update();
  }

  const explanationDiv = document.getElementById(explanationId);
  if (explanationDiv) {
    let html = `
      <div style="text-align:center; margin-top: 8px;">
        <strong style="font-size: 1.1rem;">${label}</strong><br />
        <span style="font-size: 0.9rem; color: #666;">${explanation}</span>
      </div>
    `;

    if (indicators && Object.keys(indicators).length > 0) {
      html += `<ul class="log-block">`;
      for (const [key, val] of Object.entries(indicators)) {
        const value = val?.value ?? "-";
        const score = val?.score ?? "-";
        html += `<li><strong>${key}</strong>: ${value} → <code>score ${score}</code></li>`;
      }
      html += `</ul>`;
    }

    explanationDiv.innerHTML = html;
  }
}

// ✅ Beste setup tonen
function setGaugeWithBestSetup(gauge, setup, explanationId) {
  const score = setup.score ?? 0;
  const labelIndex = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
  const label = SCORE_LABELS[labelIndex];
  const explanation = setup.explanation || "Geen uitleg.";
  const name = setup.name || "Onbekende setup";

  if (gauge) {
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((_, i) => i === labelIndex ? 100 : 20);
    gauge.update();
  }

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
}

// ✅ Hulp: Beste setup bepalen
function findBestSetup(setups) {
  if (!Array.isArray(setups)) return null;
  return setups.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
}
