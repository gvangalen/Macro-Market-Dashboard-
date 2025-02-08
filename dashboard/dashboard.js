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
function updateMacroGauge(value) {
    updateGauge("macroGauge", value);
}

// ✅ **Technische Gauge updaten**
function updateTechnicalGauge(value) {
    updateGauge("technicalGauge", value);
}

// ✅ **Setup Gauge updaten**
function updateSetupGauge(value) {
    updateGauge("setupGauge", value);
}
