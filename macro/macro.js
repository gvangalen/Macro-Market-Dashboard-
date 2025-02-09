document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Macro Indicatoren geladen!");
    
    setTimeout(() => {
        ensureMacroRemoveButtons();
        console.log("✅ Verwijderknoppen gecontroleerd.");
    }, 500);

    updateMacroData();
    setInterval(updateMacroData, 60000);
});

// ✅ **Voegt verwijderknoppen toe aan bestaande rijen**
window.ensureMacroRemoveButtons = function () {
    let tableBody = document.getElementById("macroTable")?.getElementsByTagName("tbody")[0];

    if (!tableBody) {
        console.warn("⚠️ Macro tabel niet gevonden. Probeer opnieuw over 500ms...");
        setTimeout(ensureMacroRemoveButtons, 500);
        return;
    }

    for (let row of tableBody.rows) {
        let lastCell = row.cells[row.cells.length - 1];

        // ✅ Controleer of de knop al bestaat
        if (!lastCell.querySelector("button")) {
            lastCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
            console.log("✅ Verwijderknop toegevoegd aan bestaande rij.");
        }
    }
};

// ✅ **Indicator toevoegen zonder extra kolommen**
window.addMacroRow = function () {
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    let table = document.getElementById("macroTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    // ✅ Ophalen hoeveel kolommen er in de tabelkop zitten
    let columnCount = document.getElementById("macroTable").getElementsByTagName("thead")[0].rows[0].cells.length;
    
    // ✅ Zorg ervoor dat de nieuwe rij exact evenveel cellen krijgt als de bestaande rijen
    for (let i = 0; i < columnCount - 1; i++) {  // -1 omdat de laatste kolom voor de verwijderknop is
        newRow.insertCell(i).innerText = i === 0 ? indicatorName : "N/A";
    }

    // ✅ Laatste cel: verwijderknop
    let deleteCell = newRow.insertCell(columnCount - 1);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;

    console.log(`✅ Indicator toegevoegd: ${indicatorName}`);
};

// ✅ **Rij verwijderen**
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
