console.log("✅ gauges.js correct geladen!");

function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) {
        console.warn(`⚠️ Gauge '${id}' niet gevonden!`);
        return;
    }

    let percentage = Math.max(0, Math.min(100, value)); // Zorgt dat waarde tussen 0-100 blijft

    let gaugeFill = gauge.querySelector(".gauge-fill");
    let gaugeValue = gauge.querySelector(".gauge-value");

    // 🎨 **Dynamische kleur instellen**
    let color;
    if (percentage < 30) {
        color = "#d9534f"; // Rood (Bearish)
    } else if (percentage < 60) {
        color = "#f0ad4e"; // Geel/Oranje (Neutraal)
    } else {
        color = "#4caf50"; // Groen (Bullish)
    }

    // ✅ **Update de stijl van de meter**
    if (gaugeFill) {
        gaugeFill.style.background = `conic-gradient(${color} ${percentage * 3.6}deg, #ddd 0deg)`;
    }

    // ✅ **Update de tekstwaarde**
    if (gaugeValue) {
        gaugeValue.innerText = `${percentage}%`;
    }
}

// ✅ **Functies om gauges extern te updaten**
window.setMacroGauge = function (score) {
    let percentage = ((score + 2) / 4) * 100; // Zet -2 tot 2 om naar 0-100%
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
