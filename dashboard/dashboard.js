document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
});

// ✅ **Alle meters updaten**
function updateAllGauges() {
    console.log("🔄 Data ophalen en meters updaten...");
    
    fetchGoogleTrends();
    fetchBTCDominance();
    fetchRSIBitcoin();
    fetchBitcoinData();
}

// ✅ **Macro Gauge updaten**
function updateMacroGauge(score) {
    let percentage = ((score + 2) / 4) * 100; // Schaal omzetten naar 0-100%
    updateGauge("MacroGauge", percentage);
}

// ✅ **Technische Gauge updaten**
function updateTechnicalGauge(score) {
    let percentage = ((score + 2) / 4) * 100;
    updateGauge("TechnicalGauge", percentage);
}

// ✅ **Setup Gauge updaten**
function updateSetupGauge(score) {
    let percentage = ((score + 2) / 4) * 100;
    updateGauge("SetupGauge", percentage);
}

// ✅ **Gauge opmaken en visueel updaten**
function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) return;

    let percentage = Math.max(0, Math.min(100, value)); // Zorgt dat waarde tussen 0-100 blijft

    let label = gauge.dataset.label || "Gauge"; // Zorgt dat er altijd een label is

    gauge.innerHTML = `
        <div class="gauge-label">${label}</div>
        <div class="gauge-circle">
            <div class="gauge-fill" style="transform: rotate(${percentage * 1.5}deg)"></div>
            <div class="gauge-mask"></div>
            <div class="gauge-value">${percentage}%</div>
        </div>
    `;
}

// ✅ **Dummy waardes laden (verwijderen zodra echte API-data werkt)**
document.addEventListener("DOMContentLoaded", function () {
    updateMacroGauge(-2);
    updateTechnicalGauge(1);
    updateSetupGauge(0);
});
