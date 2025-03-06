console.log("✅ macro.js geladen!");

const API_BASE_URL = "http://13.60.235.90:5002"; // ✅ AWS API-endpoint

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    updateMacroData();
    setInterval(updateMacroData, 60000); // Elke minuut verversen
});

// ✅ **Macro Data ophalen van AWS-server**
async function fetchMacroData() {
    try {
        let response = await fetch(`${API_BASE_URL}/market_data`);
        if (!response.ok) throw new Error("Fout bij ophalen macro-data");

        let data = await response.json();
        if (!data || !data.fear_greed_index || !data.crypto?.bitcoin) {
            throw new Error("Ontbrekende data in API-response");
        }

        let fearGreed = parseInt(data.fear_greed_index);
        let btcDominance = parseFloat(data.crypto.bitcoin.dominance).toFixed(2);

        console.log("📊 API Macro Data:", { fearGreed, btcDominance });

        // ✅ Update DOM & scores
        updateMacroIndicator("googleTrends", fearGreed);
        updateMacroIndicator("usdtDominance", btcDominance);

    } catch (error) {
        console.error("❌ Fout bij ophalen macro-data:", error);
    }
}

// ✅ **Update een macro-indicator in de DOM en bereken score**
function updateMacroIndicator(indicator, value) {
    let element = document.getElementById(indicator);
    if (element) element.innerText = value;

    let score = calculateMacroScore(indicator, value);
    let scoreCell = element?.parentNode?.querySelector(".macro-score");
    if (scoreCell) scoreCell.innerText = score;

    updateMacroScore();
}

// ✅ **Bereken de score voor een specifieke indicator**
function calculateMacroScore(indicator, value) {
    if (indicator === "googleTrends") {
        return value > 70 ? 2 : value > 50 ? 1 : value > 30 ? -1 : -2;
    }

    if (indicator === "usdtDominance") {
        return value < 3 ? 2 : value < 5 ? 1 : value < 7 ? -1 : -2;
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
    let advice;
    if (score >= 1.5) advice = "Bullish 🟢";
    else if (score <= -1.5) advice = "Bearish 🔴";
    else advice = "Neutraal ⚖️";

    document.getElementById("macroAdvice").innerText = advice;
}

// ✅ **Indicator handmatig toevoegen**
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
