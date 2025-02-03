document.addEventListener("DOMContentLoaded", function() {
    if (typeof JustGage === "undefined") {
        console.error("JustGage is niet correct geladen!");
        return;
    }

    // Live Bitcoin data ophalen via CoinGecko API
    async function fetchBitcoinData() {
        try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true");
            const data = await response.json();
            const btc = data.bitcoin;

            document.getElementById("btcClose").innerText = `$${btc.usd.toLocaleString()}`;
            document.getElementById("btcChange").innerText = `${btc.usd_24h_change.toFixed(2)}%`;
            document.getElementById("btcMarketCap").innerText = `$${(btc.usd_market_cap / 1e9).toFixed(2)}B`;
            document.getElementById("btcVolume").innerText = `$${(btc.usd_24h_vol / 1e9).toFixed(2)}B`;
        } catch (error) {
            console.error("Fout bij ophalen Bitcoin data:", error);
        }
    }

    fetchBitcoinData();
    setInterval(fetchBitcoinData, 60000); // Elke minuut verversen
});
