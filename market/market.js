// ✅ market.js — geüpdatet met kleuren, sortering, tooltips en score
import { API_BASE_URL } from "../config.js";

console.log("✅ market.js geladen");

let marketData = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchMarketData();
    setInterval(fetchMarketData, 60000);

    document.querySelectorAll("#marketTable th.sortable").forEach(header => {
        header.addEventListener("click", () => {
            const field = header.dataset.sort;
            sortMarketData(field);
        });
    });
});

async function fetchMarketData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard_data`);
        if (!response.ok) throw new Error("❌ Fout bij ophalen dashboard_data");

        const data = await response.json();
        marketData = data.market_data || [];

        renderMarketTable(marketData);
        document.getElementById("marketStatus").textContent = "✅ Marktdata up-to-date!";
    } catch (error) {
        console.error("❌ Fout bij laden marktdata:", error);
        document.getElementById("marketStatus").textContent = "❌ Marktdata ophalen mislukt!";
    }
}

function renderMarketTable(data) {
    const marketBody = document.getElementById("marketBody");
    marketBody.innerHTML = "";

    data.forEach(asset => {
        const row = document.createElement("tr");

        const score = calculateMarketScore(asset);

        row.innerHTML = `
            <td>${asset.symbol}</td>
            <td>${formatNumber(asset.price, true)}</td>
            <td>${formatChange(asset.change_24h)}</td>
            <td>${formatNumber(asset.volume)}</td>
            <td>${formatNumber(asset.rsi)}</td>
            <td>${formatPosition(asset.price, asset.ma_200)}</td>
            <td class="market-score">${score}</td>
            <td>${asset.timestamp ? new Date(asset.timestamp).toLocaleTimeString() : "–"}</td>
        `;
        marketBody.appendChild(row);
    });

    updateMarketSummary();
}

function calculateMarketScore(asset) {
    let score = 0;
    const change = asset.change_24h ?? 0;
    const rsi = asset.rsi ?? 50;

    if (change > 2) score += 1;
    if (change > 5) score += 1;
    if (rsi < 30) score += 1;
    if (rsi > 70) score -= 1;
    if (asset.price > asset.ma_200) score += 1;
    else score -= 1;

    return Math.max(-2, Math.min(2, score));
}

function updateMarketSummary() {
    const scores = document.querySelectorAll(".market-score");
    let total = 0, count = 0;

    scores.forEach(cell => {
        const val = parseInt(cell.textContent);
        if (!isNaN(val)) {
            total += val;
            count++;
        }
    });

    const avg = count ? (total / count).toFixed(1) : "–";
    const advice = avg >= 1.5 ? "🟢 Bullish" : avg <= -1.5 ? "🔴 Bearish" : "⚖️ Neutraal";

    document.getElementById("marketAvgScore").textContent = avg;
    document.getElementById("marketAdvice").textContent = advice;
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

function formatPosition(price, ma200) {
    if (!price || !ma200) return "–";
    return price > ma200 ? "✅ Boven 200MA" : "❌ Onder 200MA";
}

function sortMarketData(field) {
    const keyMap = {
        symbol: "symbol",
        price: "price",
        change: "change_24h",
        volume: "volume",
        rsi: "rsi",
        ma: "ma_200",
        score: "score"
    };

    const key = keyMap[field];
    if (!key) return;

    marketData.sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
    renderMarketTable(marketData);
}
