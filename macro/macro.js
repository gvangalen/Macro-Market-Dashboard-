document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    
    // ✅ Wacht tot de tabel volledig geladen is en voeg verwijderknoppen toe
    setTimeout(ensureMacroRemoveButtons, 500);

    updateMacroData();
    setInterval(updateMacroData, 60000);
});

// ✅ **Verwijderknoppen toevoegen aan ALLE bestaande rijen**
window.ensureMacroRemoveButtons = function () {
    let tableBody = document.getElementById("macroTable")?.getElementsByTagName("tbody")[0];

    if (!tableBody) {
        console.warn("⚠️ Macro tabel nog niet geladen, probeer opnieuw...");
        setTimeout(ensureMacroRemoveButtons, 500);
        return;
    }

    for (let row of tableBody.rows) {
        let lastCell = row.cells[row.cells.length - 1]; // Pak de laatste kolom

        // ✅ Controleer of de knop al bestaat, zo niet: voeg toe
        if (!lastCell.querySelector("button")) {
            lastCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
        }
    }

    console.log("✅ Verwijderknoppen correct toegevoegd aan alle rijen!");
};

// ✅ **Indicator toevoegen (gebruikt een prompt)**
window.addMacroRow = function () {
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    let table = document.getElementById("macroTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    // ✅ Exacte hoeveelheid kolommen toevoegen (Voorkomt extra kolommen)
    newRow.insertCell(0).innerText = indicatorName;
    newRow.insertCell(1).innerText = "Laden...";
    newRow.insertCell(2).innerText = "N/A";
    newRow.insertCell(3).innerText = "N/A";
    newRow.insertCell(4).innerText = "N/A";

    // ✅ Verwijderknop in de juiste kolom
    let deleteCell = newRow.insertCell(5);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;

    console.log(`✅ Indicator toegevoegd: ${indicatorName}`);
};

// ✅ **Rij verwijderen zonder extra kolommen**
window.removeRow = function (button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    console.log("❌ Indicator verwijderd!");
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
