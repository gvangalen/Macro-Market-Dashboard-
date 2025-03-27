import { API_BASE_URL } from "../config.js";

console.log("✅ Dashboard.js versie 2025-03-27 23:11 geladen");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");

    const macroGauge = createGauge("macroGauge", "Macro");
    const technicalGauge = createGauge("technicalGauge", "Technisch");
    const setupGauge = createGauge("setupGauge", "Setup");

    initEmptyTables();
    initTableButtons();

    fetchDashboardData(macroGauge, technicalGauge, setupGauge);
    setInterval(() => fetchDashboardData(macroGauge, technicalGauge, setupGauge), 300000);
});

function initEmptyTables() {
    ["macroTable", "technicalTable", "setupTable", "marketTable"].forEach((id) => {
        const tbody = document.querySelector(`#${id} tbody`);
        if (tbody && tbody.rows.length === 0) {
            const colCount = tbody.closest("table").rows[0].cells.length;
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = colCount;
            cell.style.textAlign = "center";
            cell.innerText = "Geen data";
            row.appendChild(cell);
            tbody.appendChild(row);
        }
    });
}

function initTableButtons() {
    document.getElementById("addMacroBtn")?.addEventListener("click", () =>
        addTableRow("macroTable", ["Macro X", "100"])
    );
    document.getElementById("addTechnicalBtn")?.addEventListener("click", () =>
        addTableRow("technicalTable", ["Technisch X", "80"])
    );
    document.getElementById("addSetupBtn")?.addEventListener("click", () =>
        addTableRow("setupTable", ["Setup X", "Actief"])
    );
}

function addTableRow(tableId, values) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    if (tableBody.innerText.includes("Geen data") || tableBody.innerText.includes("–")) {
        tableBody.innerHTML = "";
    }

    const row = tableBody.insertRow();
    values.forEach((val) => {
        const cell = row.insertCell();
        cell.innerText = val;
    });

    const deleteCell = row.insertCell();
    const delBtn = document.createElement("button");
    delBtn.innerText = "🗑️";
    delBtn.addEventListener("click", () => row.remove());
    deleteCell.appendChild(delBtn);
}

async function safeFetch(url) {
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
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
}

function createGauge(elementId) {
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

async function fetchDashboardData(macroGauge, technicalGauge, setupGauge) {
    const data = await safeFetch("/dashboard_data");
    if (!data) return console.error("❌ Dashboard-data niet beschikbaar");

    try {
        const latestMacro = await safeFetch("/macro_data");
        if (macroGauge && latestMacro) {
            const macroScore = calculateMacroScore(latestMacro);
            updateGauge(macroGauge, macroScore);
        }

        const btc = data.market_data?.find(d => d.symbol === "BTC");
        if (technicalGauge && btc) {
            const techScore = calculateTechnicalScore(btc);
            updateGauge(technicalGauge, techScore);
        }

        if (setupGauge) {
            const setups = await safeFetch("/setups?symbol=BTC");
            const activeSetups = Array.isArray(setups) ? setups.length : 0;
            updateGauge(setupGauge, activeSetups > 0 ? 2 : -2);
        }

        renderMarketTable(data.market_data, data.technical_data);
        console.log("✅ Dashboard bijgewerkt!");
    } catch (e) {
        console.error("❌ Fout bij verwerken dashboard-data:", e);
    }
}

function updateGauge(gauge, score) {
    if (!gauge) return;
    const index = Math.max(0, Math.min(4, Math.round((score + 2) / 4 * 4)));
    gauge.data.datasets[0].data = gauge.data.datasets[0].data.map((v, i) => (i === index ? 100 : 20));
    gauge.update();
}

function calculateMacroScore(macroData) {
    let score = 0;
    if (macroData.fear_greed_index > 75) score += 2;
    else if (macroData.fear_greed_index > 50) score += 1;
    else if (macroData.fear_greed_index > 30) score -= 1;
    else score -= 2;

    if (macroData.btc_dominance > 55) score += 1;
    else if (macroData.btc_dominance < 50) score -= 1;

    if (macroData.dxy < 100) score += 2;
    else if (macroData.dxy < 103) score += 1;
    else if (macroData.dxy < 106) score -= 1;
    else score -= 2;

    return Math.max(-2, Math.min(2, score));
}

function calculateTechnicalScore(btc) {
    let score = 0;
    if (btc.change_24h > 3) score += 2;
    else if (btc.change_24h > 1.5) score += 1;
    else if (btc.change_24h < -3) score -= 2;
    else score -= 1;

    if (btc.volume > 50000000000) score += 1;
    return Math.max(-2, Math.min(2, score));
}

function renderMarketTable(marketData, technicalData) {
    const tableBody = document.querySelector("#marketTable tbody");
    if (!tableBody || !Array.isArray(marketData)) return;

    tableBody.innerHTML = "";
    marketData.forEach(asset => {
        const row = tableBody.insertRow();
        const tech = Array.isArray(technicalData) ? technicalData.find(d => d.symbol === asset.symbol) : {};

        row.insertCell().innerText = asset.symbol;
        row.insertCell().innerText = Number(asset.price).toFixed(2);
        row.insertCell().innerText = `${Number(asset.change_24h).toFixed(2)}%`;
        row.insertCell().innerText = Number(asset.volume).toLocaleString();
        row.insertCell().innerText = tech?.rsi ?? "–";
        row.insertCell().innerText = tech?.ma_200 ?? "–";
    });
}
