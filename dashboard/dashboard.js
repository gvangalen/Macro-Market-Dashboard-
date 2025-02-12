document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");
    
    // ✅ Maak gauges aan met Chart.js
    const macroGauge = createGauge("macroGauge", "Macro");
    const technicalGauge = createGauge("technicalGauge", "Technisch");
    const setupGauge = createGauge("setupGauge", "Setup");

    // ✅ API ophalen en dashboard updaten
    fetchMarketData(macroGauge, technicalGauge, setupGauge);
    setInterval(() => fetchMarketData(macroGauge, technicalGauge, setupGauge), 3600000); // Elk uur verversen
});

// ✅ **Functie om Chart.js gauges te maken**
function createGauge(elementId, label) {
    const ctx = document.getElementById(elementId).getContext("2d");
    return new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sterke Sell", "Sell", "Neutraal", "Buy", "Sterke Buy"],
            datasets: [{
                data: [20, 20, 20, 20, 20], // Evenredige verdeling
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
    fetch("http://127.0.0.1:5002/market_data")
        .then(response => response.json())
        .then(data => {
            console.log("📊 Ontvangen API-data:", data);

            // ✅ Marktcondities ophalen uit API
            updateGauge(macroGauge, data.macro_score);
            updateGauge(technicalGauge, data.technical_score);

            // ✅ Check of setup actief is
            checkActiveSetups(setupGauge, data);
        })
        .catch(error => console.error("❌ API-fout:", error));
}

// ✅ **Update gauge met nieuwe waarde**
function updateGauge(gauge, score) {
    let index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4))); // Zet -2 tot 2 om naar 0-4 index
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((v, i) => (i === index ? 100 : 20));
    gauge.update();
}

// ✅ **Check actieve setups en update SetupGauge**
function checkActiveSetups(setupGauge, marketData) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let activeSetups = 0;

    setups.forEach(setup => {
        if (setup.trend === marketData.trend && marketData.indicators.includes(setup.indicators)) {
            activeSetups++;
        }
    });

    console.log(`🔎 Actieve setups gevonden: ${activeSetups}`);
    updateGauge(setupGauge, activeSetups > 0 ? 2 : -2); // ✅ Groen als een setup actief is
}
