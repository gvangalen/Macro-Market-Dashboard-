import { API_BASE_URL } from "../config.js"; // ✅ Gebruik centrale API-config

console.log("✅ macro.js correct geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    updateMacroData();
    setInterval(updateMacroData, 60000); // Elke minuut verversen
});

// ✅ **Helperfunctie voor veilige API-aanvragen met retry**
async function safeFetch(url) {
    let retries = 3;
    while (retries > 0) {
        try {
            let response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error(`Fout bij ophalen data van ${url}`);

            let data = await response.json();
            if (!data || Object.keys(data).length === 0) {
                throw new Error(`Lege of ongeldige data ontvangen van ${url}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec wachten
        }
    }
}

// ✅ **Macro Data ophalen en updaten**
async function updateMacroData() {
    let data = await safeFetch("/macro_data"); // ✅ API voor macro-data
    if (!data) return console.error("❌ Ongeldige of ontbrekende macro-data ontvangen!");

    let fearGreed = parseInt(data.fear_greed_index) || 0;
    let btcDominance = parseFloat(data.btc_dominance).toFixed(2) || "N/A";
    let dxy = isNaN(data.dxy) ? "N/A" : parseFloat(data.dxy).toFixed(2); // Controleer op NaN voor DXY

    console.log("📊 API Macro Data:", { fearGreed, btcDominance, dxy });

    updateMacroIndicator("fearGreed", fearGreed);
    updateMacroIndicator("btcDominance", btcDominance);
    updateMacroIndicator("dxy", dxy);
}

// ✅ **Update een macro-indicator in de DOM en bereken score**
function updateMacroIndicator(indicator, value) {
    let element = document.getElementById(indicator);
    if (element) element.innerText = value;

    let score = calculateMacroScore(indicator, value);
    if (isNaN(score)) score = 0;  // Voeg controle toe op NaN waarde

    let scoreCell = element?.parentNode?.querySelector(".macro-score");
    if (scoreCell) scoreCell.innerText = score;

    updateMacroScore();
}

// ✅ **Bereken de score voor een specifieke indicator**
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

    return 0; // Fallback als indicator niet bekend is
}

// ✅ **Totale macro-score berekenen**
function updateMacroScore() {
    let scoreCells = document.querySelectorAll(".macro-score");
    let totalScore = 0;
    let count = 0;

    scoreCells.forEach(cell => {
        let score = parseInt(cell.innerText);
        if (!isNaN(score)) {
            totalScore += score;
            count++;
        }
    });

    let avgScore = count > 0 ? (totalScore / count).toFixed(1) : "N/A";
    document.getElementById("macroTotalScore").innerText = avgScore;
    updateMacroAdvice(avgScore);
}

// ✅ **Advies genereren op basis van macro-score**
function updateMacroAdvice(score) {
    let advice = "Neutraal ⚖️";
    if (score >= 1.5) advice = "Bullish 🟢";
    else if (score <= -1.5) advice = "Bearish 🔴";

    document.getElementById("macroAdvice").innerText = advice;
}

// ✅ **Indicator handmatig toevoegen (voor test/doeleinden)**
function addMacroRow() {
    let table = document.getElementById("macroTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

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

// ✅ **Rij verwijderen**
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateMacroScore();
}
