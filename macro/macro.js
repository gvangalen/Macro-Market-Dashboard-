document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    updateMacroData();
    setInterval(updateMacroData, 60000); // Elke minuut verversen
});

// ✅ **Macro Data ophalen van AWS-server**
async function fetchMacroData() {
    try {
        let response = await fetch("http://13.60.235.90:5002/market_data");
        let data = await response.json();
        
        let fearGreed = parseInt(data.fear_greed_index);
        let btcDominance = parseFloat(data.crypto.bitcoin.volume / 1000000000).toFixed(2); // Omzetten naar percentage
        
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
        if (value > 70) score = 2;
        else if (value > 50) score = 1;
        else if (value > 30) score = -1;
        else score = -2;
    }

    if (indicator === "usdtDominance") {
        if (value < 3) score = 2;
        else if (value < 5) score = 1;
        else if (value < 7) score = -1;
        else score = -2;
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
    let advice = "Neutraal";
    if (score >= 1.5) advice = "Bullish 🟢";
    else if (score <= -1.5) advice = "Bearish 🔴";
    
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
