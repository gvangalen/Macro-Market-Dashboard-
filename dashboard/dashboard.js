document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");

    // ✅ Live data ophalen en dashboard bijwerken
    fetchMarketData();
    setInterval(fetchMarketData, 3600000); // Elk uur updaten
});

// ✅ **Live Market Data ophalen via API**
async function fetchMarketData() {
    try {
        const response = await fetch("http://127.0.0.1:5002/market_data"); // 🚀 Pas aan naar jouw API URL
        if (!response.ok) throw new Error("❌ API fout: " + response.status);
        
        const data = await response.json();
        console.log("📊 Marktdata ontvangen:", data);
        
        // ✅ Update dashboard met marktdata
        updateDashboard(data);
        checkActiveSetups(data);
    } catch (error) {
        console.error("⚠️ Kon market data niet ophalen:", error);
    }
}

// ✅ **Dashboard met API-data bijwerken**
function updateDashboard(data) {
    document.getElementById("btc_price").textContent = `$${data.crypto.bitcoin.price}`;
    document.getElementById("sol_price").textContent = `$${data.crypto.solana.price}`;
    document.getElementById("macro_fear_greed").textContent = data.fear_greed_index;
    
    updateMacroGauge(data.fear_greed_index);
    updateTechnicalGauge(data.crypto.bitcoin.change_24h);
}

// ✅ **Macro Gauge updaten**
function updateMacroGauge(score) {
    let percentage = ((score - 0) / 100) * 100;
    updateGauge("MacroGauge", percentage);
}

// ✅ **Technische Gauge updaten**
function updateTechnicalGauge(change24h) {
    let percentage = ((change24h + 5) / 10) * 100;
    updateGauge("TechnicalGauge", percentage);
}

// ✅ **Setup Gauge updaten**
function updateSetupGauge(activeSetups) {
    let percentage = activeSetups > 0 ? 100 : 0;
    updateGauge("SetupGauge", percentage);
}

// ✅ **Gauge opmaken en visueel updaten**
function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) {
        console.warn(`⚠️ Gauge met ID '${id}' niet gevonden!");
        return;
    }
    let percentage = Math.max(0, Math.min(100, value));
    gauge.innerHTML = `
        <div class="gauge-label">${id}</div>
        <div class="gauge-circle">
            <div class="gauge-fill" style="transform: rotate(${percentage * 1.5}deg)"></div>
            <div class="gauge-mask"></div>
            <div class="gauge-value">${percentage}%</div>
        </div>
    `;
}

// ✅ **Check of setups actief zijn en update SetupGauge**
function checkActiveSetups(marketData) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let activeSetups = setups.filter(setup => matchSetupToMarket(setup, marketData)).length;
    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateSetupGauge(activeSetups);
}

// ✅ **Setup matching met live marktanalyse**
function matchSetupToMarket(setup, marketData) {
    return setup.trend === marketData.trend || marketData.indicator.includes(setup.indicators);
}
