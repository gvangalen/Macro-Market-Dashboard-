// dashboard.js
import { API_BASE_URL } from "../config.js";

console.log("✅ Dashboard.js versie 2025-04-01 geladen");

let macroGauge, technicalGauge, setupGauge;

function createGauge(elementId, label) {
    const ctx = document.getElementById(elementId)?.getContext("2d");
    if (!ctx) return null;
    return new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sterke Sell", "Sell", "Neutraal", "Buy", "Sterke Buy"],
            datasets: [{
                data: [20, 20, 20, 20, 20],
                backgroundColor: ["#ff3b30", "#ff9500", "#f0ad4e", "#4cd964", "#34c759"],
                borderWidth: 0
            }]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: "80%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    macroGauge = createGauge("macroGauge", "Macro");
    technicalGauge = createGauge("technicalGauge", "Technisch");
    setupGauge = createGauge("setupGauge", "Setup");

    initEmptyTables();
    fetchDashboardData();
    setInterval(fetchDashboardData, 300000); // elke 5 min

    const btn = document.getElementById("addMacroBtn");
    if (btn) {
        btn.addEventListener("click", async () => {
            const nameInput = document.getElementById("macroNameInput");
            const name = nameInput?.value?.trim();
            if (!name) return alert("⚠️ Vul een indicatornaam in!");

            try {
                const res = await fetch(`${API_BASE_URL}/macro_data/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                });

                if (!res.ok) {
                    const msg = await res.text();
                    throw new Error(msg);
                }

                const result = await res.json();
                alert(result.message || "Succesvol toegevoegd!");
                nameInput.value = "";
                fetchDashboardData();
            } catch (err) {
                console.error("❌ Fout bij toevoegen macro-indicator:", err);
                alert("Fout: " + err.message);
            }
        });
    }
});

function initEmptyTables() {
    ["macroTable", "technicalTable", "setupTable", "marketTable"].forEach(id => {
        const tbody = document.querySelector(`#${id} tbody`);
        if (tbody && tbody.rows.length === 0) {
            const colCount = tbody.closest("table").rows[0].cells.length;
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = colCount;
            cell.innerText = "Geen data";
            cell.style.textAlign = "center";
            row.appendChild(cell);
            tbody.appendChild(row);
        }
    });
}

async function fetchDashboardData() {
    try {
        const data = await safeFetch("/dashboard_data");
        if (!data) return;

        const macro = await safeFetch("/macro_data/list");
        if (macroGauge && macro) {
            updateGauge(macroGauge, calculateMacroScore(macro));
            renderMacroTable(macro);
        }

        const btc = data.market_data?.find(d => d.symbol === "BTC");
        if (technicalGauge && btc) {
            updateGauge(technicalGauge, calculateTechnicalScore(btc));
        }

        const setups = await safeFetch("/setups?symbol=BTC");
        if (setupGauge && Array.isArray(setups)) {
            updateGauge(setupGauge, setups.length > 0 ? 2 : -2);
            renderSetupTable(setups);
        }

        renderMarketTable(data.market_data, data.technical_data);
    } catch (err) {
        console.error("❌ Fout tijdens laden dashboard:", err);
    }
}

function safeFetch(url) {
    return fetch(`${API_BASE_URL}${url}`)
        .then(res => {
            if (!res.ok) throw new Error(`Fout bij ophalen data van ${url}`);
            return res.json();
        })
        .catch(err => {
            console.error(`❌ API-fout bij ${url}:`, err);
            return null;
        });
}

function updateGauge(gauge, score) {
    if (!gauge) return;
    const index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((_, i) => (i === index ? 100 : 20));
    gauge.update();
}

function calculateMacroScore(indicators) {
    let score = 0;
    const get = name => indicators.find(i => i.name === name)?.value ?? null;

    const fg = get("fear_greed_index");
    if (fg !== null) {
        if (fg > 75) score += 2;
        else if (fg > 50) score += 1;
        else if (fg > 30) score -= 1;
        else score -= 2;
    }

    const dom = get("btc_dominance");
    if (dom !== null) {
        if (dom > 55) score += 1;
        else if (dom < 50) score -= 1;
    }

    const dxy = get("dxy");
    if (dxy !== null) {
        if (dxy < 100) score += 2;
        else if (dxy < 103) score += 1;
        else if (dxy < 106) score -= 1;
        else score -= 2;
    }

    return Math.max(-2, Math.min(2, score));
}

function calculateTechnicalScore(asset) {
    let score = 0;
    if (asset.change_24h > 3) score += 2;
    else if (asset.change_24h > 1.5) score += 1;
    else if (asset.change_24h < -3) score -= 2;
    else score -= 1;

    if (asset.volume > 50000000000) score += 1;
    return Math.max(-2, Math.min(2, score));
}

function renderMacroTable(indicators) {
    const tbody = document.querySelector("#macroTable tbody");
    tbody.innerHTML = "";
    if (!Array.isArray(indicators) || indicators.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.innerText = "Geen data";
        cell.style.textAlign = "center";
        return;
    }
    indicators.forEach(i => {
        const row = tbody.insertRow();
        row.insertCell().innerText = i.name;
        row.insertCell().innerText = i.value;
        row.insertCell().innerText = i.trend ?? "–";
        row.insertCell().innerText = i.interpretation ?? "–";
        row.insertCell().innerText = i.action ?? "–";
        const del = row.insertCell();
        const btn = document.createElement("button");
        btn.innerText = "🗑️";
        btn.addEventListener("click", () => row.remove()); // Placeholder
        del.appendChild(btn);
    });
}

function renderMarketTable(marketData, technicalData) {
    const tbody = document.querySelector("#marketTable tbody");
    tbody.innerHTML = "";
    if (!Array.isArray(marketData)) return;

    marketData.forEach(asset => {
        const row = tbody.insertRow();
        const tech = technicalData.find(t => t.symbol === asset.symbol);
        row.insertCell().innerText = asset.symbol;
        row.insertCell().innerText = Number(asset.price).toFixed(2);
        row.insertCell().innerText = `${Number(asset.change_24h).toFixed(2)}%`;
        row.insertCell().innerText = Number(asset.volume).toLocaleString();
        row.insertCell().innerText = tech?.rsi ?? "–";
        row.insertCell().innerText = tech?.ma_200 ?? "–";
    });
}

function renderSetupTable(setups) {
    const tbody = document.querySelector("#setupTable tbody");
    tbody.innerHTML = "";
    if (!Array.isArray(setups) || setups.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.innerText = "Geen data";
        cell.style.textAlign = "center";
        return;
    }
    setups.forEach(s => {
        const row = tbody.insertRow();
        row.insertCell().innerText = s.name;
        row.insertCell().innerText = s.status;
        const del = row.insertCell();
        const btn = document.createElement("button");
        btn.innerText = "🗑️";
        btn.addEventListener("click", () => row.remove()); // Placeholder
        del.appendChild(btn);
    });
}
