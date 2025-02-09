document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");

    // ✅ Direct de meters bijwerken met dummywaarden (totdat API-data werkt)
    updateMacroGauge(-2);
    updateTechnicalGauge(1);
    checkActiveSetups();

    // ✅ Elke minuut setups opnieuw checken en bijwerken
    setInterval(checkActiveSetups, 60000);
});

// ✅ **Macro Gauge updaten**
function updateMacroGauge(score) {
    let percentage = ((score + 2) / 4) * 100;
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

    let percentage = Math.max(0, Math.min(100, value));
    let label = gauge.dataset.label || "Gauge"; 

    gauge.innerHTML = `
        <div class="gauge-label">${label}</div>
        <div class="gauge-circle">
            <div class="gauge-fill" style="transform: rotate(${percentage * 1.5}deg)"></div>
            <div class="gauge-mask"></div>
            <div class="gauge-value">${percentage}%</div>
        </div>
    `;
}

// ✅ **Check of setups actief zijn en update SetupGauge**
function checkActiveSetups() {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let activeSetups = 0;

    setups.forEach(setup => {
        if (matchSetupToMarket(setup)) {
            activeSetups++;
        }
    });

    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateSetupGauge(activeSetups);
}

// ✅ **Setup matching met marktanalyse**
function matchSetupToMarket(setup) {
    let marketData = getCurrentMarketData(); // ✅ Haal live marktdata op
    if (!marketData) return false;

    // 🔥 Simpele vergelijking (later uitbreiden met extra checks)
    return setup.trend === marketData.trend && 
           setup.indicator === marketData.indicator;
}

// ✅ **Mockup: Live marktdata ophalen**
function getCurrentMarketData() {
    // 🚀 Hier API koppelen voor real-time data
    return {
        trend: "bullish",  // 🔥 Dummywaarde (later API-data)
        indicator: "RSI-overbought"
    };
}
