import { API_BASE_URL } from "../config.js";

console.log("✅ macro.js correct geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    updateMacroData();
    setInterval(updateMacroData, 60000); // Elke minuut verversen
});

// ✅ Veilige fetch
async function safeFetch(url) {
    let retries = 3;
    while (retries > 0) {
        try {
            let response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error(`Fout bij ophalen data van ${url}`);

            let data = await response.json();
            if (!data || Object.keys(data).length === 0) {
                throw new Error(`Lege of ongeldige data van ${url}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// ✅ Macro-data ophalen en verwerken uit dashboard endpoint
async function updateMacroData() {
    const dashboard = await safeFetch("/api/dashboard_data");
    if (!dashboard || !dashboard.macro_data) {
        return console.error("❌ Ongeldige of ontbrekende macro-data ontvangen!");
    }

    const indicators = dashboard.macro_data;

    const fearGreed = parseFloat(getValue(indicators, "fear_greed_index"));
    const btcDominance = parseFloat(getValue(indicators, "btc_dominance"));
    const dxy = parseFloat(getValue(indicators, "dxy"));

    console.log("📊 Macro-data:", { fearGreed, btcDominance, dxy });

    updateMacroIndicator("fearGreed", fearGreed);
    updateMacroIndicator("btcDominance", btcDominance);
    updateMacroIndicator("dxy", dxy);
}

function getValue(indicators, name) {
    return indicators.find(i => i.name === name)?.value ?? null;
}

function updateMacroIndicator(indicator, value) {
    const el = document.getElementById(indicator);
    if (el) el.innerText = value;

    const score = calculateMacroScore(indicator, value);
    const scoreCell = el?.parentNode?.querySelector(".macro-score");
    if (scoreCell) scoreCell.innerText = score;

    updateMacroScore();
}

function calculateMacroScore(indicator, value) {
    if (indicator === "fearGreed") {
        return value > 75 ? 2 : value > 50 ? 1 : value > 30 ? -1 : -2;
    }
    if (indicator === "btcDominance") {
        return value > 55 ? 2 : value > 50 ? 1 : value > 45 ? -1 : -2;
    }
    if (indicator === "dxy") {
        return value < 100 ? 2 : value < 103 ? 1 : value < 106 ? -1 : -2;
    }
    return 0;
}

function updateMacroScore() {
    const scoreCells = document.querySelectorAll(".macro-score");
    let total = 0;
    let count = 0;

    scoreCells.forEach(cell => {
        const score = parseInt(cell.innerText);
        if (!isNaN(score)) {
            total += score;
            count++;
        }
    });

    const avg = count > 0 ? (total / count).toFixed(1) : "N/A";
    const el = document.getElementById("macroTotalScore");
    if (el) el.innerText = avg;

    updateMacroAdvice(avg);
}

function updateMacroAdvice(score) {
    const el = document.getElementById("macroAdvice");
    if (!el) return;

    let advice = "⚖️ Neutraal";
    if (score >= 1.5) advice = "🟢 Bullish";
    else if (score <= -1.5) advice = "🔴 Bearish";

    el.innerText = advice;
}

// ✅ Handmatig toevoegen (optioneel/test)
function addMacroRow() {
    const table = document.getElementById("macroTable")?.getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Indicator"></td>
        <td>Laden...</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td class="macro-score">-</td>
        <td><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;
}

function removeRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateMacroScore();
}
