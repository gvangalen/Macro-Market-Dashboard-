// api/api.js
const apiBaseUrl = "http://13.60.235.90:5002"; // ✅ AWS API-endpoint

async function fetchMacroData() {
    try {
        let response = await fetch(`${apiBaseUrl}/macro_data`);
        if (!response.ok) throw new Error("Fout bij ophalen macro-data");
        
        let data = await response.json();
        document.getElementById("googleTrends").innerText = data.fear_greed;
        document.getElementById("usdtDominance").innerText = `${data.usdt_dominance}%`;
        updateScore("googleScore", data.fear_greed, [30, 50, 70], true);
        updateScore("usdtScore", data.usdt_dominance, [3, 5, 7], false);
    } catch (error) {
        console.error("❌ Fout bij ophalen macro-data:", error);
    }
}

async function fetchMarketData() {
    try {
        let response = await fetch(`${apiBaseUrl}/market_data`);
        if (!response.ok) throw new Error("Fout bij ophalen marktdata");
        
        let data = await response.json();
        let btc = data.crypto.bitcoin;
        
        document.getElementById("btcClose").innerText = `$${btc.price.toLocaleString()}`;
        document.getElementById("btcChange").innerText = `${btc.change_24h.toFixed(2)}%`;
        document.getElementById("btcMarketCap").innerText = `$${(btc.market_cap / 1e9).toFixed(2)}B`;
        document.getElementById("btcVolume").innerText = `$${(btc.volume / 1e9).toFixed(2)}B`;
    } catch (error) {
        console.error("❌ Fout bij ophalen Bitcoin data:", error);
    }
}

// ✅ **Alle data in één keer ophalen**
async function fetchAllData() {
    fetchMacroData();
    fetchMarketData();
}

document.addEventListener("DOMContentLoaded", function () {
    fetchAllData();
    setInterval(fetchAllData, 60000); // Elke minuut updaten
});
