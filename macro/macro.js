document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    ensureMacroRemoveButtons();
    updateMacroData();
    setInterval(updateMacroData, 60000);
});

// ✅ Voeg verwijderknoppen toe aan bestaande indicatoren
function ensureMacroRemoveButtons() {
    let tableBody = document.getElementById("macroTable").getElementsByTagName("tbody")[0];

    for (let row of tableBody.rows) {
        if (!row.cells[6].querySelector("button")) { 
            let deleteCell = row.cells[6];
            deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
        }
    }
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
    updateMacroScore(); // Herbereken de totale score bij verwijderen
}

// ✅ **Macro Indicatoren updaten**
async function updateMacroData() {
    fetchGoogleTrends();
    fetchBTCDominance();
}

// ✅ **Google Trends ophalen**
async function fetchGoogleTrends() {
    try {
        let response = await fetch("https://api.alternative.me/fng/");
        let data = await response.json();
        let fearGreed = parseInt(data.data[0].value);
        document.getElementById("googleTrends").innerText = fearGreed;
        updateScore("googleTrends", fearGreed);
    } catch (error) {
        console.error("❌ Fout bij ophalen Google Trends:", error);
    }
}

// ✅ **BTC Dominantie ophalen**
async function fetchBTCDominance() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/global");
        let data = await response.json();
        let btcDominance = parseFloat(data.data.market_cap_percentage.btc.toFixed(2));
        document.getElementById("usdtDominance").innerText = btcDominance + "%";
        updateScore("usdtDominance", btcDominance);
    } catch (error) {
        console.error("❌ Fout bij ophalen BTC Dominantie:", error);
    }
}

// ✅ **Score berekenen voor een indicator**
function updateScore(indicator, value) {
    let score = 0;

    if (indicator === "googleTrends") {
        if (value > 70) score = 2; // Bullish
        else if (value > 50) score = 1;
        else if (value > 30) score = -1;
        else score = -2; // Bearish
    }

    if (indicator === "usdtDominance") {
        if (value < 3) score = 2; // Bullish (lage USDT dominantie)
        else if (value < 5) score = 1;
        else if (value < 7) score = -1;
        else score = -2; // Bearish (hoge USDT dominantie)
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
