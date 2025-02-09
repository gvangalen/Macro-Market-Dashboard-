console.log("✅ gauges.js correct geladen!");

let macroGauge, technicalGauge, setupGauge;

// ✅ **Maak Chart.js Meters**
document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Initialiseren van de meters...");

    const createGauge = (ctx, label) => new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"],
            datasets: [{
                data: [20, 20, 20, 20, 20], // Verdeling van 5 segmenten
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
});

// ✅ **Gauge bijwerken met score (-2 tot +2)**
function updateGauge(gauge, score) {
    if (!gauge) return;
    let index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4))); // Zet -2 tot 2 om naar index 0-4
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((v, i) => (i === index ? 100 : 20)); // Zet wijzer op de juiste plek
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

// ✅ **Gauges direct instellen met dummywaarden**
document.addEventListener("DOMContentLoaded", function () {
    setMacroGauge(-1);   // Licht bearish
    setTechnicalGauge(1); // Neutraal
    setSetupGauge(2);    // Bullish
});
