document.addEventListener("DOMContentLoaded", function () {
    console.log("Market.js geladen ✅");

    // ✅ API URL voor Bitcoin market data (CoinGecko)
    const apiUrl = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=daily";

    // ✅ HTML-elementen koppelen
    const btcOpen = document.getElementById("btcOpen");
    const btcHigh = document.getElementById("btcHigh");
    const btcLow = document.getElementById("btcLow");
    const btcClose = document.getElementById("btcClose");
    const btcChange = document.getElementById("btcChange");

    // ✅ Haal Bitcoin market data op
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const prices = data.prices;
            const openPrice = prices[0][1]; // Eerste prijs van de dag
            const closePrice = prices[prices.length - 1][1]; // Laatste prijs van de dag
            const highPrice = Math.max(...prices.map(p => p[1])); // Hoogste prijs
            const lowPrice = Math.min(...prices.map(p => p[1])); // Laagste prijs

            // ✅ Bereken 24h % verandering
            const percentChange = ((closePrice - openPrice) / openPrice) * 100;

            // ✅ Zet waarden in tabel
            btcOpen.textContent = `$${openPrice.toFixed(2)}`;
            btcHigh.textContent = `$${highPrice.toFixed(2)}`;
            btcLow.textContent = `$${lowPrice.toFixed(2)}`;
            btcClose.textContent = `$${closePrice.toFixed(2)}`;
            btcChange.textContent = `${percentChange.toFixed(2)}%`;

            // ✅ Positieve of negatieve kleur
            btcChange.style.color = percentChange >= 0 ? "green" : "red";
        })
        .catch(error => {
            console.error("❌ Fout bij ophalen Bitcoin market data:", error);
            btcOpen.textContent = "Error";
            btcHigh.textContent = "Error";
            btcLow.textContent = "Error";
            btcClose.textContent = "Error";
            btcChange.textContent = "Error";
        });
});
