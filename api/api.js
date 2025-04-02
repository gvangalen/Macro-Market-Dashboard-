import { API_BASE_URL } from "../config.js";

// ✅ API-call met retries
async function fetchData(url) {
    let retries = 3;
    while (retries > 0) {
        try {
            let response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error(`Fout bij ophalen data van ${url}`);

            let data = await response.json();
            if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
                throw new Error(`Lege of ongeldige data ontvangen van ${url}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ Fout bij ophalen van ${url}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// ✅ Dashboarddata ophalen
async function fetchDashboardData() {
    const data = await fetchData("/api/dashboard_data");
    if (!data) return;

    renderMacro(data.macro_data);
    renderMarket(data.market_data);
    renderTechnical(data.technical_data);
}

// ✅ Macro
function renderMacro(indicators) {
    const fg = indicators.find(i => i.name === "fear_greed_index")?.value;
    const usdt = indicators.find(i => i.name === "usdt_dominance")?.value;

    if (fg !== undefined) {
        setText("googleTrends", fg);
        updateScore("googleScore", fg, [30, 50, 70], true);
    }

    if (usdt !== undefined) {
        setText("usdtDominance", `${usdt}%`);
        updateScore("usdtScore", usdt, [3, 5, 7], false);
    }
}

// ✅ Marktdata
function renderMarket(data) {
    const btc = data.find(a => a.symbol === "BTC");
    if (!btc) return;

    setText("btcClose", `$${btc.price.toLocaleString()}`);
    setText("btcChange", `${btc.change_24h.toFixed(2)}%`);
    setText("btcMarketCap", btc.market_cap ? `$${(btc.market_cap / 1e9).toFixed(2)}B` : "–");
    setText("btcVolume", `$${(btc.volume / 1e9).toFixed(2)}B`);
}

// ✅ Technische data (optioneel)
function renderTechnical(data) {
    // Vul in als je technische tabellen live wil vullen
}

// ✅ Helpers
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function updateScore(id, value, thresholds, isPositive) {
    const score = calculateScore(value, thresholds, isPositive);
    setText(id, score);
}

function calculateScore(value, thresholds, isPositive) {
    if (isPositive) {
        return value > thresholds[2] ? 2 : value > thresholds[1] ? 1 : value > thresholds[0] ? -1 : -2;
    } else {
        return value < thresholds[0] ? 2 : value < thresholds[1] ? 1 : value < thresholds[2] ? -1 : -2;
    }
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    setInterval(fetchDashboardData, 60000);
});
