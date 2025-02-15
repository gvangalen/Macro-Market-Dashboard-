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

// ✅ **Functie om Chart.js gauges te maken**
function createGauge(elementId, label) {
    const ctx = document.getElementById(elementId).getContext("2d");
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
function fetchMarketData(macroGauge, technicalGauge, setupGauge) {
    fetch("http://13.60.235.90:5002/market_data")  // ✅ AWS-server gebruiken
        .then(response => response.json())
        .then(data => {
            console.log("📊 Ontvangen API-data:", data);

            if (!data.crypto || !data.fear_greed_index) {
                throw new Error("Ongeldige API-response");
            }

            // ✅ Update gauges
            updateGauge(macroGauge, calculateMacroScore(data.fear_greed_index));
            updateGauge(technicalGauge, calculateTechnicalScore(data.crypto));

            // ✅ Check setups
            checkActiveSetups(setupGauge, data);
        })
        .catch(error => console.error("❌ API-fout:", error));
}

// ✅ **Bereken Macro Score**
function calculateMacroScore(fearGreed) {
    if (fearGreed > 70) return 2; // Bullish
    if (fearGreed > 50) return 1;
    if (fearGreed > 30) return -1;
    return -2; // Bearish
}

// ✅ **Bereken Technische Score**
function calculateTechnicalScore(cryptoData) {
    let btc = cryptoData.bitcoin;
    let sol = cryptoData.solana;

    let score = 0;
    if (btc.change_24h > 2 || sol.change_24h > 2) score += 2;
    else if (btc.change_24h > 1 || sol.change_24h > 1) score += 1;
    else if (btc.change_24h < -2 || sol.change_24h < -2) score -= 2;
    else score -= 1;

    return score;
}

// ✅ **Update gauge met nieuwe waarde**
function updateGauge(gauge, score) {
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
