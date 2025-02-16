document.addEventListener("DOMContentLoaded", function () {
    console.log("Market.js geladen ✅");

    // ✅ API URL van jouw AWS-server
    const apiUrl = "http://13.60.235.90:5002/market_data";

    // ✅ HTML-elementen koppelen
    const btcElements = {
        open: document.getElementById("btcOpen"),
        high: document.getElementById("btcHigh"),
        low: document.getElementById("btcLow"),
        close: document.getElementById("btcClose"),
        change: document.getElementById("btcChange")
    };
    
    const solElements = {
        open: document.getElementById("solOpen"),
        high: document.getElementById("solHigh"),
        low: document.getElementById("solLow"),
        close: document.getElementById("solClose"),
        change: document.getElementById("solChange")
    };

    // ✅ Haal market data op van AWS
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("API-fout bij ophalen market data");
            return response.json();
        })
        .then(data => {
            console.log("📊 API Market Data ontvangen:", data);

            updateMarketData(btcElements, data.crypto.bitcoin);
            updateMarketData(solElements, data.crypto.solana);
        })
        .catch(error => {
            console.error("❌ Fout bij ophalen market data van AWS:", error);
            Object.values(btcElements).concat(Object.values(solElements)).forEach(el => el.textContent = "Error");
        });
});

// ✅ **Market data bijwerken**
function updateMarketData(elements, data) {
    elements.open.textContent = `$${data.price.toFixed(2)}`;
    elements.high.textContent = `Volume: ${data.volume.toLocaleString()}`;
    elements.low.textContent = `24h Change: ${data.change_24h.toFixed(2)}%`;
    elements.close.textContent = "N/A";
    elements.change.textContent = `${data.change_24h.toFixed(2)}%`;
    elements.change.style.color = data.change_24h >= 0 ? "green" : "red";
}
