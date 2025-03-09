const marketApiUrl = "http://13.60.235.90:5002/market_data"; // ✅ AWS API endpoint

async function fetchMarketData() {
    try {
        let response = await fetch(marketApiUrl);
        if (!response.ok) throw new Error("❌ API-fout bij ophalen marktdata!");

        let data = await response.json();
        if (!data.crypto || Object.keys(data.crypto).length === 0) throw new Error("❌ Geen crypto-data beschikbaar!");

        let marketBody = document.getElementById("marketBody");
        marketBody.innerHTML = ""; // 🔄 Oude data wissen

        // ✅ Zet data om naar een array en filter ontbrekende waarden
        let cryptoData = Object.entries(data.crypto)
            .map(([name, coinData]) => ({
                name: name.toUpperCase(),
                open: coinData.open ?? "N/A",
                high: coinData.high ?? "N/A",
                low: coinData.low ?? "N/A",
                close: coinData.close ?? "N/A",
                change_24h: coinData.change_24h ?? 0,
                market_cap: coinData.market_cap ?? 0,
                volume: coinData.volume ?? 0
            }))
            .sort((a, b) => b.market_cap - a.market_cap); // 🔄 Sorteer op marktkapitalisatie (grootste bovenaan)

        // ✅ Genereer rijen in de tabel
        cryptoData.forEach(coin => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${coin.name}</td>
                <td>${formatNumber(coin.open, true)}</td>
                <td>${formatNumber(coin.high, true)}</td>
                <td>${formatNumber(coin.low, true)}</td>
                <td>${formatNumber(coin.close, true)}</td>
                <td style="color: ${coin.change_24h >= 0 ? "green" : "red"};">
                    ${coin.change_24h.toFixed(2)}%
                </td>
                <td>${formatNumber(coin.market_cap)}</td>
                <td>${formatNumber(coin.volume)}</td>
            `;
            marketBody.appendChild(row);
        });

        document.getElementById("marketStatus").textContent = "✅ Marktdata up-to-date!";
    } catch (error) {
        console.error(error);
        document.getElementById("marketStatus").textContent = "❌ Fout bij ophalen marktdata!";
    }
}

// ✅ **Slimme formatter voor grote getallen (miljoenen/miljarden)**
function formatNumber(num, isPrice = false) {
    if (num === "N/A") return num; // ❌ Voorkomt NaN fouten
    let formatted = num >= 1e9 ? `${(num / 1e9).toFixed(2)}B` :
                    num >= 1e6 ? `${(num / 1e6).toFixed(2)}M` :
                    isPrice ? `$${parseFloat(num).toFixed(2)}` : parseFloat(num).toLocaleString();
    return formatted;
}

document.addEventListener("DOMContentLoaded", function () {
    fetchMarketData();
    setInterval(fetchMarketData, 60000); // 🔄 Elke minuut updaten
});
