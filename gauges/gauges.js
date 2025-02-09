// ✅ **Gauge opmaken met CSS en dynamisch updaten**
function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) return;

    let percentage = Math.max(0, Math.min(100, value)); // Zorg dat waarde tussen 0-100 blijft

    gauge.innerHTML = `
        <div class="gauge-label">${gauge.dataset.label}</div>
        <div class="gauge-circle">
            <div class="gauge-fill" style="transform: rotate(${percentage * 1.5}deg)"></div>
            <div class="gauge-mask"></div>
            <div class="gauge-value">${percentage}%</div>
        </div>
    `;
}

// ✅ **Functies om gauges van buitenaf te updaten**
window.setMacroGauge = function (score) {
    let percentage = ((score + 2) / 4) * 100; // Schaal omzetten naar 0-100%
    updateGauge("MacroGauge", percentage);
};

window.setTechnicalGauge = function (score) {
    let percentage = ((score + 2) / 4) * 100;
    updateGauge("TechnicalGauge", percentage);
};

window.setSetupGauge = function (score) {
    let percentage = ((score + 2) / 4) * 100;
    updateGauge("SetupGauge", percentage);
};

// ✅ **Gauges bij laden alvast invullen met dummywaarden**
document.addEventListener("DOMContentLoaded", function () {
    setMacroGauge(-2);       // -2 → Bearish (0% richting groen)
    setTechnicalGauge(1);    // 1 → Neutraal
    setSetupGauge(0);        // 0 → Tussen neutraal en bearish
});
