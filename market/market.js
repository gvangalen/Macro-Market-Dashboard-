import { API_BASE_URL } from "../config.js"; // Gebruik altijd centrale config

console.log("✅ market.js geladen");

async function fetchMarketData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard_data`);
        if (!response.ok) throw new Error("❌ Fout bij ophalen dashboard_data");

        const data = await response.json();
        const marketData = data.market_data;

        if (!Array.isArray(marketData)) throw new Error("❌ Marktdata ongeldig of ontbreekt!");

        const marketBody = document.getElementById("marketBody");
        marketBody.innerHTML = "";

        marketData.forEach(asset => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${asset.symbol}</td>
                <td>${formatNumber(asset.price, true)}</td>
                <td>${formatChange(asset.change_24h)}</td>
                <td>${formatNumber(asset.volume)}</td>
                <td>${asset.timestamp ? new Date(asset.timestamp).toLocaleString() : "–"}</td>
            `;
            marketBody.appendChild(row);
        });

        document.getElementById("marketStatus").textContent = "✅ Marktdata up-to-date!";
    } catch (error) {
        console.error("❌ Fout bij laden marktdata:", error);
        document.getElementById("marketStatus").textContent = "❌ Marktdata ophalen mislukt!";
    }
}

function formatNumber(num, isPrice = false) {
    if (num === null || num === "N/A") return "–";
    return isPrice ? `$${Number(num).toFixed(2)}` : Number(num).toLocaleString();
}

function formatChange(change) {
    if (change === null || change === undefined) return "–";
    const color = change >= 0 ? "green" : "red";
    return `<span style="color:${color};">${Number(change).toFixed(2)}%</span>`;
}

document.addEventListener("DOMContentLoaded", function () {
    fetchMarketData();
    setInterval(fetchMarketData, 60000);
});
