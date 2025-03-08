import { API_BASE_URL } from "../config.js"; // ✅ Gebruik centrale API-config

console.log("✅ gauges.js correct geladen!");

let macroGauge, technicalGauge, setupGauge;

// ✅ **Gauges aanmaken met Chart.js**
document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Initialiseren van de meters...");

    const createGauge = (ctx) => new Chart(ctx, {
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
            rotation: -90,
            circumference: 180,
            cutout: "80%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        }
    });

    macroGauge = createGauge(document.getElementById("macroGauge"));
    technicalGauge = createGauge(document.getElementById("technicalGauge"));
    setupGauge = createGauge(document.getElementById("setupGauge"));

    fetchMarketData();
    setInterval(fetchMarketData, 60000); // Elke minuut bijwerken
});

// ✅ **Helperfunctie voor veilige API-aanvragen met retry**
async function safeFetch(url) {
    let retries = 3;
    while (retries > 0) {
        try {
            let response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error(`Fout bij ophalen data van ${url}`);

            let data = await response.json();
            if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
                throw new Error(`Lege of ongeldige data ontvangen van ${url}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec wachten
        }
    }
}

// ✅ **API ophalen en gauges bijwerken**
async function fetchMarketData() {
    let data = await safeFetch("/market_data");
    if (!data || !data.crypto) return console.error("❌ Ongeldige of lege API-response!");

    let btc = data.crypto.bitcoin;
    let sol = data.crypto.solana;
    if (!btc || !sol) return console.error("❌ Geen Bitcoin of Solana-data gevonden!");

    console.log("📊 Ontvangen API-data:", data);

    updateGauge(macroGauge, calculateMacroScore(data.fear_greed_index));
    updateGauge(technicalGauge, calculateTechnicalScore(btc, sol));
    updateSetupGauge(setupGauge, btc, sol, data.fear_greed_index);
}

// ✅ **Bereken Macro Score**
function calculateMacroScore(fearGreed) {
    if (fearGreed === undefined || fearGreed === null) return 0;
    return fearGreed > 75 ? 2 : fearGreed > 50 ? 1 : fearGreed > 25 ? -1 : -2;
}

// ✅ **Bereken Technische Score**
function calculateTechnicalScore(btc, sol) {
    let priceChange = Math.max(btc.change_24h, sol.change_24h);
    let score = priceChange > 3 ? 2 : priceChange > 1.5 ? 1 : priceChange < -3 ? -2 : -1;

    if (btc.volume > 50000000000) score += 1;
    if (sol.volume > 5000000000) score += 1;

    return Math.max(-2, Math.min(2, score));
}

// ✅ **Check actieve setups en update SetupGauge**
function updateSetupGauge(setupGauge, btc, sol, fearGreed) {
    let activeSetups = 0;

    if (fearGreed > 50) activeSetups++;
    if (btc.change_24h > 2) activeSetups++;
    if (sol.change_24h > 2) activeSetups++;

    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateGauge(setupGauge, activeSetups > 0 ? 2 : -2);
}

// ✅ **Gauge bijwerken met nieuwe score (-2 tot +2)**
function updateGauge(gauge, score) {
    if (!gauge) return;
    let index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((v, i) => (i === index ? 100 : 20));
    gauge.update();
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
