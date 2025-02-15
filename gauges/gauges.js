console.log("✅ gauges.js correct geladen!");

let macroGauge, technicalGauge, setupGauge;

// ✅ **Gauges aanmaken met Chart.js**
document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Initialiseren van de meters...");

    const createGauge = (ctx, label) => new Chart(ctx, {
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
            rotation: -90, // Begin onderaan
            circumference: 180, // Halve cirkel
            cutout: "80%", // Dunne ring
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        }
    });

    macroGauge = createGauge(document.getElementById("macroGauge"), "Macro");
    technicalGauge = createGauge(document.getElementById("technicalGauge"), "Technisch");
    setupGauge = createGauge(document.getElementById("setupGauge"), "Setup");

    // ✅ Eerste keer data ophalen
    fetchMarketData();
    setInterval(fetchMarketData, 60000); // Elke minuut bijwerken
});

// ✅ **Gauge bijwerken met nieuwe score (-2 tot +2)**
function updateGauge(gauge, score) {
    if (!gauge) return;
    let index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4))); // Zet -2 tot 2 om naar 0-4 index
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((v, i) => (i === index ? 100 : 20));
    gauge.update();
}

// ✅ **API ophalen en gauges bijwerken**
async function fetchMarketData() {
    try {
        let response = await fetch("http://13.60.235.90:5002/market_data");
        let data = await response.json();
        
        console.log("📊 Ontvangen API-data:", data);

        // ✅ Update gauges met ontvangen scores
        updateGauge(macroGauge, parseFloat(data.fear_greed_index));
        updateGauge(technicalGauge, calculateTechnicalScore(data.crypto));
        checkActiveSetups(setupGauge, data);
    } catch (error) {
        console.error("❌ API-fout:", error);
    }
}

// ✅ **Technische score berekenen**
function calculateTechnicalScore(cryptoData) {
    let btc = cryptoData.bitcoin;
    let sol = cryptoData.solana;
    
    let score = 0;
    if (btc.change_24h > 2 || sol.change_24h > 2) score += 1;
    if (btc.volume > 5000000000 || sol.volume > 1000000000) score += 1;
    if (btc.change_24h < -2 || sol.change_24h < -2) score -= 1;
    
    return Math.max(-2, Math.min(2, score)); // Beperk tussen -2 en 2
}

// ✅ **Check actieve setups en update SetupGauge**
function checkActiveSetups(setupGauge, marketData) {
    let activeSetups = 0;
    
    // Placeholder setup validatie
    if (marketData.fear_greed_index > 50) activeSetups++;
    if (marketData.crypto.bitcoin.change_24h > 2) activeSetups++;
    
    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateGauge(setupGauge, activeSetups > 0 ? 2 : -2);
}

// ✅ **Extern aanroepbare functies**
window.setMacroGauge = function (score) {
    console.log(`🔄 Macro gauge: ${score}`);
    updateGauge(macroGauge, score);
};

window.setTechnicalGauge = function (score) {
    console.log(`🔄 Technische gauge: ${score}`);
    updateGauge(technicalGauge, score);
};

window.setSetupGauge = function (score) {
    console.log(`🔄 Setup gauge: ${score}`);
    updateGauge(setupGauge, score);
};
