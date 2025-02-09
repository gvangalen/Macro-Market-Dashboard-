document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");

    // ✅ Direct de meters bijwerken met dummywaarden (totdat API-data werkt)
    updateMacroGauge(-2);
    updateTechnicalGauge(1);
    checkActiveSetups(); // 🔥 Check of er actieve setups zijn en update de SetupGauge
});

// ✅ **Macro Gauge updaten**
function updateMacroGauge(score) {
    let percentage = ((score + 2) / 4) * 100; // Schaal omzetten naar 0-100%
    updateGauge("MacroGauge", percentage);
}

// ✅ **Technische Gauge updaten**
function updateTechnicalGauge(score) {
    let percentage = ((score + 2) / 4) * 100;
    updateGauge("TechnicalGauge", percentage);
}

// ✅ **Setup Gauge updaten**
function updateSetupGauge(activeSetups) {
    let percentage = activeSetups > 0 ? 100 : 0; // ✅ Groen als er een actieve setup is
    updateGauge("SetupGauge", percentage);
}

// ✅ **Gauge opmaken en visueel updaten**
function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) {
        console.warn(`⚠️ Gauge met ID '${id}' niet gevonden!`);
        return;
    }

    let percentage = Math.max(0, Math.min(100, value)); // Zorgt dat waarde tussen 0-100 blijft
    let label = gauge.dataset.label || "Gauge"; // Zorgt dat er altijd een label is

    gauge.innerHTML = `
        <div class="gauge-label">${label}</div>
        <div class="gauge-circle">
            <div class="gauge-fill" style="transform: rotate(${percentage * 1.5}deg)"></div>
            <div class="gauge-mask"></div>
            <div class="gauge-value">${percentage}%</div>
        </div>
    `;
}

// ✅ **Check of een setup actief is en update SetupGauge**
function checkActiveSetups() {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let activeSetups = 0;

    setups.forEach(setup => {
        let isActive = matchSetupToMarket(setup);
        if (isActive) activeSetups++;
    });

    updateSetupGauge(activeSetups);
}

// ✅ **Simpele check of een setup actief is (later koppelen aan echte data)**
function matchSetupToMarket(setup) {
    let marketTrend = "bullish"; // 🔥 DIT LATER AUTOMATISCH OPHALEN
    return setup.trend === marketTrend;
}
