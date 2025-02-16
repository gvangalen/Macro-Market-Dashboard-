document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    updateMacroData();
    setInterval(updateMacroData, 60000); // Elke minuut verversen
});

// ✅ **Macro Data ophalen van AWS-server**
async function fetchMacroData() {
    try {
        let response = await fetch("http://13.60.235.90:5002/market_data");
        if (!response.ok) throw new Error("Fout bij ophalen macro-data");
        
        let data = await response.json();
        let fearGreed = parseInt(data.fear_greed_index);
        let btcDominance = parseFloat(data.crypto.bitcoin.dominance).toFixed(2);
        
        console.log("📊 API Macro Data:", { fearGreed, btcDominance });
        
        // ✅ Update DOM & scores
        document.getElementById("googleTrends").innerText = fearGreed;
        updateScore("googleTrends", fearGreed);
        
        document.getElementById("usdtDominance").innerText = btcDominance + "%";
        updateScore("usdtDominance", btcDominance);
    } catch (error) {
        console.error("❌ Fout bij ophalen macro-data:", error);
    }
}

// ✅ **Update macro scores op basis van indicatoren**
function updateScore(indicator, value) {
    let score = 0;

    if (indicator === "googleTrends") {
        score = value > 70 ? 2 : value > 50 ? 1 : value > 30 ? -1 : -2;
    }
    
    if (indicator === "usdtDominance") {
        score = value < 3 ? 2 : value < 5 ? 1 : value < 7 ? -1 : -2;
    }

    let scoreCell = document.getElementById(indicator).parentNode.querySelector(".macro-score");
    if (scoreCell) scoreCell.innerText = score;

    updateMacroScore();
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
    let advice = score >= 1.5 ? "Bullish 🟢" : score <= -1.5 ? "Bearish 🔴" : "Neutraal";
    document.getElementById("macroAdvice").innerText = advice;
}

// ✅ **Indicator toevoegen**
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
