document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    ensureMacroRemoveButtons();
    updateMacroData();
    setInterval(updateMacroData, 60000);
});

window.ensureMacroRemoveButtons = function () {
    let tableBody = document.getElementById("macroTable").getElementsByTagName("tbody")[0];

    for (let row of tableBody.rows) {
        let lastCell = row.cells[row.cells.length - 1]; // Laatste cel in de rij

        // ✅ Controleer of de knop al bestaat, anders toevoegen
        if (!lastCell.querySelector("button")) {
            lastCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
        }
    }
};

// ✅ Roep deze functie aan bij het laden van de pagina
document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    ensureMacroRemoveButtons(); // ✅ Nu worden alle rijen direct voorzien van een verwijderknop
    updateMacroData();
    setInterval(updateMacroData, 60000);
});

window.addMacroRow = function () {
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    let table = document.getElementById("macroTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    newRow.innerHTML = `
        <td>${indicatorName}</td>
        <td>Laden...</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;
};

// ✅ **Rij verwijderen** (Maak globaal beschikbaar!)
window.removeRow = function (button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
};

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
    } catch (error) {
        console.error("❌ Fout bij ophalen BTC Dominantie:", error);
    }
};
