// api/api.js
const apiBaseUrl = "http://13.60.235.90:5002"; // ✅ AWS API-endpoint

// ✅ **Helperfunctie voor veilige API-aanvragen met retry**
async function fetchData(url) {
    let retries = 3;
    while (retries > 0) {
        try {
            let response = await fetch(`${apiBaseUrl}${url}`);
            if (!response.ok) throw new Error(`Fout bij ophalen data van ${url}`);

            return await response.json();
        } catch (error) {
            console.error(`❌ Fout bij ophalen data van ${url}:`, error);
            retries--;
            if (retries === 0) {
                return null; // Geef null terug bij een definitieve fout
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec wachten
        }
    }
}

// ✅ **Macrodata ophalen**
async function fetchMacroData() {
    let data = await fetchData("/api/macro_data"); // ✅ Correcte API-route
    if (!data) return;

    setText("googleTrends", data.fear_greed);
    setText("usdtDominance", `${data.usdt_dominance}%`);
    updateScore("googleScore", data.fear_greed, [30, 50, 70], true);
    updateScore("usdtScore", data.usdt_dominance, [3, 5, 7], false);
}

// ✅ **Marktdata ophalen**
async function fetchMarketData() {
    let data = await fetchData("/api/market_data"); // ✅ Correcte API-route
    if (!data || !data.length) return;

    let btc = data.find(asset => asset.symbol === "BTC");
    if (!btc) return console.error("❌ Geen Bitcoin-data gevonden!");

    setText("btcClose", `$${btc.price.toLocaleString()}`);
    setText("btcChange", `${btc.change_24h.toFixed(2)}%`);
    setText("btcMarketCap", `$${(btc.market_cap / 1e9).toFixed(2)}B`);
    setText("btcVolume", `$${(btc.volume / 1e9).toFixed(2)}B`);
}

// ✅ **Helperfunctie om tekst in een element te zetten**
function setText(elementId, text) {
    let el = document.getElementById(elementId);
    if (el) el.innerText = text;
}

// ✅ **Alle data ophalen**
async function fetchAllData() {
    await fetchMacroData();
    await fetchMarketData();
}

// ✅ **Pagina laden en elke minuut verversen**
document.addEventListener("DOMContentLoaded", function () {
    fetchAllData();
    setInterval(fetchAllData, 60000); // Elke minuut updaten
});
