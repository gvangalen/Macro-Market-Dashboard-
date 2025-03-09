import { API_BASE_URL } from "../config.js"; // ✅ Config.js importeren

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");

    // ✅ Initialiseer de gauges
    const macroGauge = createGauge("macroGauge", "Macro");
    const technicalGauge = createGauge("technicalGauge", "Technisch");
    const setupGauge = createGauge("setupGauge", "Setup");

    // ✅ API ophalen en dashboard updaten
    fetchMarketData(macroGauge, technicalGauge, setupGauge);
    setInterval(() => fetchMarketData(macroGauge, technicalGauge, setupGauge), 300000); // Elke 5 min verversen
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

// ✅ **Functie om Chart.js gauges te maken**
function createGauge(elementId, label) {
    const ctx = document.getElementById(elementId)?.getContext("2d");
    if (!ctx) return null;

    return new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sterke Sell", "Sell", "Neutraal", "Buy", "Sterke Buy"],
            datasets: [{
                data: [20, 20, 20, 20, 20],
                backgroundColor: ["#ff3b30", "#ff9500", "#f0ad4e", "#4cd964", "#34c759"],
                borderWidth: 0
            }]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: "80%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        }
    });
}

// ✅ **Data ophalen en meters updaten**
async function fetchMarketData(macroGauge, technicalGauge, setupGauge) {
    let macroData = await safeFetch("/macro_data"); // ✅ API voor macro
    let marketData = await safeFetch("/market_data"); // ✅ API voor marktdata

    if (!macroData) return console.error("❌ Ongeldige of ontbrekende macro-data ontvangen!");
    if (!marketData || !Array.isArray(marketData)) return console.error("❌ Ongeldige of lege marktdata ontvangen!");

    let btc = marketData.find(asset => asset.symbol === "BTC");
    if (!btc) return console.error("❌ Geen Bitcoin-data gevonden!");

    console.log("📊 Ontvangen API Macro Data:", macroData);
    console.log("📊 Ontvangen API Market Data:", marketData);

    // ✅ Update gauges
    if (macroGauge) updateGauge(macroGauge, calculateMacroScore(macroData));
    if (technicalGauge) updateGauge(technicalGauge, calculateTechnicalScore(btc));
    if (setupGauge) checkActiveSetups(setupGauge, marketData);
}

// ✅ **Bereken Macro Score op basis van alleen 3 factoren**
function calculateMacroScore(macroData) {
    let score = 0;

    // ✅ Fear & Greed Index
    if (macroData.fear_greed_index > 75) score += 2;
    else if (macroData.fear_greed_index > 50) score += 1;
    else if (macroData.fear_greed_index > 30) score -= 1;
    else score -= 2;

    // ✅ BTC Dominantie
    if (macroData.btc_dominance > 55) score += 1;
    else if (macroData.btc_dominance < 50) score -= 1;

    // ✅ DXY (Dollar Index)
    if (macroData.dxy < 100) score += 2;
    else if (macroData.dxy < 103) score += 1;
    else if (macroData.dxy < 106) score -= 1;
    else score -= 2;

    return Math.max(-2, Math.min(2, score)); // Limiteer tussen -2 en 2
}

// ✅ **Bereken Technische Score**
function calculateTechnicalScore(btc) {
    let score = 0;
    if (btc.change_24h > 3) score += 2;
    else if (btc.change_24h > 1.5) score += 1;
    else if (btc.change_24h < -3) score -= 2;
    else score -= 1;

    if (btc.volume > 50000000000) score += 1; // Hoge volume bullish

    return Math.max(-2, Math.min(2, score)); // Limiteer score tussen -2 en 2
}

// ✅ **Update gauge met nieuwe waarde**
function updateGauge(gauge, score) {
    if (!gauge) return;
    let index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((v, i) => (i === index ? 100 : 20));
    gauge.update();
}

// ✅ **Check actieve setups en update SetupGauge**
function checkActiveSetups(setupGauge, marketData) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let activeSetups = setups.filter(setup => setup.trend === marketData.trend).length;

    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateGauge(setupGauge, activeSetups > 0 ? 2 : -2);
}
