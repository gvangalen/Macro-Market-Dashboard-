console.log("✅ gauges.js correct geladen!");

let macroGauge, technicalGauge, setupGauge;
const API_BASE_URL = "http://13.60.235.90:5002"; // ✅ AWS API-endpoint

// ✅ **Gauges aanmaken met Chart.js**
document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Initialiseren van de meters...");

    const createGauge = (ctx, label) => new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Sterke Sell", "Sell", "Neutraal", "Buy", "Sterke Buy"],
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

    // ✅ Meters aanmaken
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
        let response = await fetch(`${API_BASE_URL}/market_data`);
        if (!response.ok) throw new Error("API-fout bij ophalen market data");

        let data = await response.json();
        console.log("📊 Ontvangen API-data:", data);

        if (!data.crypto || !data.fear_greed_index) {
            throw new Error("Ongeldige API-response");
        }

        // ✅ Update gauges met ontvangen scores
        updateGauge(macroGauge, calculateMacroScore(data.fear_greed_index));
        updateGauge(technicalGauge, calculateTechnicalScore(data.crypto));
        updateSetupGauge(setupGauge, data);

    } catch (error) {
        console.error("❌ API-fout:", error);
    }
}

// ✅ **Bereken Macro Score**
function calculateMacroScore(fearGreed) {
    if (fearGreed >= 75) return 2; // Zeer bullish
    if (fearGreed >= 50) return 1; // Bullish
    if (fearGreed >= 25) return -1; // Bearish
    return -2; // Zeer bearish
}

// ✅ **Bereken Technische Score**
function calculateTechnicalScore(cryptoData) {
    if (!cryptoData.bitcoin || !cryptoData.solana) return 0; // Fallback als data ontbreekt

    let btc = cryptoData.bitcoin;
    let sol = cryptoData.solana;

    let score = 0;
    let priceChange = Math.max(btc.change_24h, sol.change_24h); // Neemt de grootste prijsverandering

    if (priceChange > 3) score += 2;
    else if (priceChange > 1.5) score += 1;
    else if (priceChange < -3) score -= 2;
    else score -= 1;

    if (btc.volume > 50000000000) score += 1; // Hoge volume bullish
    if (sol.volume > 5000000000) score += 1;

    return Math.max(-2, Math.min(2, score)); // Limiteer score tussen -2 en 2
}

// ✅ **Check actieve setups en update SetupGauge**
function updateSetupGauge(setupGauge, marketData) {
    if (!marketData.crypto || !marketData.fear_greed_index) return;

    let activeSetups = 0;

    if (marketData.fear_greed_index > 50) activeSetups++;
    if (marketData.crypto.bitcoin.change_24h > 2) activeSetups++;
    if (marketData.crypto.solana.change_24h > 2) activeSetups++;

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
