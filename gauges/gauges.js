// ✅ **Gauge dynamisch updaten met juiste kleuren & correcte rotatie**
function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) return;

    let percentage = Math.max(0, Math.min(100, value)); // Zorg dat waarde tussen 0-100 blijft

    let gaugeFill = gauge.querySelector(".gauge-fill");
    let gaugeValue = gauge.querySelector(".gauge-value");

    // 🎨 **Dynamische kleur instellen**
    let color = percentage < 40 ? "#d9534f" : percentage > 60 ? "#4caf50" : "#f0ad4e"; // Rood / Geel / Groen

    // ✅ **Update de stijl van de meter**
    if (gaugeFill) {
        gaugeFill.style.background = `conic-gradient(${color} ${percentage * 3.6}deg, #ddd 0deg)`;
        gaugeFill.style.transform = `rotate(${percentage * 1.8}deg)`; // Correcte schaal voor 360°
    }
    console.log("✅ gauges.js correct geladen!");

    // ✅ **Update de tekstwaarde**
    if (gaugeValue) {
        gaugeValue.innerText = `${percentage}%`;
    }
}

// ✅ **Functies om gauges van buitenaf te updaten**
window.setMacroGauge = function (score) {
    let percentage = ((score + 2) / 4) * 100; // -2 tot 2 omzetten naar 0-100%
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

// ✅ **Gauges direct updaten met dummywaarden**
document.addEventListener("DOMContentLoaded", function () {
    setMacroGauge(-2);       // Bearish → Rood (0%)
    setTechnicalGauge(1);    // Neutraal → Geel (tussen 40-60%)
    setSetupGauge(0);        // Licht bearish → Geel/oranje (tussen 30-50%)
});
