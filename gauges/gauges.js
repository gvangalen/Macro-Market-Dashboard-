// ✅ **Gauge updaten**
function updateGauge(id, value) {
    let gauge = document.getElementById(id);
    if (!gauge) return;

    gauge.innerText = value + "%"; // Eenvoudige weergave
    gauge.style.background = `conic-gradient(#4caf50 ${value * 3.6}deg, #ddd 0deg)`;
}

// ✅ **Dummy waardes laden**
document.addEventListener("DOMContentLoaded", function () {
    updateGauge("macroGauge", 50);
    updateGauge("technicalGauge", 65);
    updateGauge("setupGauge", 80);
});
