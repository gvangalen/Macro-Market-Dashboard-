// ✅ **Bitcoin Data ophalen en updaten in de tabel**
async function fetchBitcoinData() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true");
        let data = await response.json();
        let btc = data.bitcoin;

        document.getElementById("btcOpen").innerText = "Laden..."; // CoinGecko heeft geen Open prijs
        document.getElementById("btcHigh").innerText = "Laden..."; // CoinGecko heeft geen High prijs
        document.getElementById("btcLow").innerText = "Laden..."; // CoinGecko heeft geen Low prijs
        document.getElementById("btcClose").innerText = `$${btc.usd.toLocaleString()}`;
        document.getElementById("btcChange").innerText = `${btc.usd_24h_change.toFixed(2)}%`;
        document.getElementById("btcMarketCap").innerText = `$${(btc.usd_market_cap / 1e9).toFixed(2)}B`;
        document.getElementById("btcVolume").innerText = `$${(btc.usd_24h_vol / 1e9).toFixed(2)}B`;
    } catch (error) {
        console.error("❌ Fout bij ophalen Bitcoin data:", error);
    }
}

// ✅ **Data automatisch updaten elke 60 seconden**
setInterval(fetchBitcoinData, 60000);
fetchBitcoinData(); // Laad direct bij opstarten
