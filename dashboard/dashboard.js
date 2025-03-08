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
    let data = await safeFetch("/api/market_data"); // ✅ Correcte API-route
    if (!data || !Array.isArray(data)) return console.error("❌ Ongeldige of lege API-response!");

    let btc = data.find(asset => asset.symbol === "BTC");
    if (!btc) return console.error("❌ Geen Bitcoin-data gevonden!");

    console.log("📊 Ontvangen API-data:", data);

    // ✅ Update gauges
    if (macroGauge) updateGauge(macroGauge, calculateMacroScore(btc));
    if (technicalGauge) updateGauge(technicalGauge, calculateTechnicalScore(btc));
    if (setupGauge) checkActiveSetups(setupGauge, data);
}

// ✅ **Bereken Macro Score**
function calculateMacroScore(btc) {
    if (!btc.fear_greed) return 0;
    return btc.fear_greed > 75 ? 2 : btc.fear_greed > 50 ? 1 : btc.fear_greed > 25 ? -1 : -2;
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
