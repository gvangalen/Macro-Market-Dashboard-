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
    let marketData = getCurrentMarketData(); // ✅ Haal live marktdata op

    setups.forEach(setup => {
        if (matchSetupToMarket(setup, marketData)) {
            activeSetups++;
        }
    });

    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateSetupGauge(activeSetups);
}

// ✅ **Setup matching met live marktanalyse**
function matchSetupToMarket(setup, marketData) {
    if (!marketData) return false;

    // 🔥 Setup moet minstens deels matchen (niet 100% strikte match)
    let trendMatch = setup.trend === marketData.trend;
    let indicatorMatch = marketData.indicator.includes(setup.indicators);

    console.log(`📊 Check setup: ${setup.name} | Trend: ${setup.trend} vs. Markt: ${marketData.trend} | Indicator: ${setup.indicators} vs. Markt: ${marketData.indicator}`);
    
    return trendMatch || indicatorMatch; // ✅ Als één van beiden klopt, is de setup actief
}

// ✅ **Mockup: Live marktdata ophalen (later API koppelen)**
function getCurrentMarketData() {
    // 🚀 Hier API koppelen voor real-time data
    return {
        trend: "bullish",  // 🔥 Dummywaarde (later API-data)
        indicator: "RSI-overbought" // 🔥 Dummy indicator
    };
}
