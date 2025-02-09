document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    ensureTechButtons();
});

// ✅ Zorg ervoor dat elke rij en kolom een verwijderknop heeft
function ensureTechButtons() {
    let tableBody = document.getElementById("analysisTable").getElementsByTagName("tbody")[0];
    let headerRow = document.getElementById("analysisTable").getElementsByTagName("thead")[0].rows[0];

    // ✅ Voeg verwijderknoppen toe voor bestaande assets
    for (let row of tableBody.rows) {
        let lastCell = row.cells[row.cells.length - 1];
        if (!lastCell.querySelector("button")) {
            lastCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
        }
    }

    // ✅ Voeg verwijderknoppen toe voor bestaande indicatoren
    for (let i = 1; i < headerRow.cells.length - 1; i++) {
        let cell = headerRow.cells[i];
        if (!cell.querySelector("button")) {
            cell.innerHTML += ` <button class="btn-remove" onclick="removeTechIndicator(this)">❌</button>`;
        }
    }
}

// ✅ **Asset toevoegen met bestaande indicatoren**
window.addTechRow = function () {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return;

    let table = document.getElementById("analysisTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    // ✅ Voeg de asset naam toe
    newRow.insertCell(0).innerText = assetName;

    // ✅ Haal aantal indicatoren op en voeg cellen toe
    let headerRow = document.getElementById("analysisTable").getElementsByTagName("thead")[0].rows[0];
    let indicatorCount = headerRow.cells.length - 2; // Asset en Actie kolom tellen niet mee

    for (let i = 0; i < indicatorCount; i++) {
        let newCell = newRow.insertCell(i + 1);
        newCell.innerHTML = "Laden...";
    }

    // ✅ Voeg verwijderknop toe
    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
};

// ✅ **Indicator toevoegen aan alle assets**
window.addTechIndicator = function () {
    let table = document.getElementById("analysisTable");
    let headerRow = table.getElementsByTagName("thead")[0].rows[0];
    let bodyRows = table.getElementsByTagName("tbody")[0].rows;

    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    // ✅ Controleer of de indicator al bestaat
    for (let cell of headerRow.cells) {
        if (cell.textContent.includes(indicatorName)) {
            alert("Deze indicator bestaat al!");
            return;
        }
    }

    // ✅ Nieuwe kolom toevoegen aan de tabelheader
    let newHeader = document.createElement("th");
    newHeader.innerHTML = `${indicatorName} <button class="btn-remove" onclick="removeTechIndicator(this)">❌</button>`;
    headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 1]);

    // ✅ Voeg de nieuwe indicator toe aan alle bestaande assets
    for (let row of bodyRows) {
        let newCell = row.insertCell(row.cells.length - 1);
        newCell.innerHTML = "Laden...";
    }
};

// ✅ **Indicator verwijderen**
window.removeTechIndicator = function (button) {
    let headerRow = document.getElementById("analysisTable").getElementsByTagName("thead")[0].rows[0];
    let tableBody = document.getElementById("analysisTable").getElementsByTagName("tbody")[0];

    let columnIndex = button.parentNode.cellIndex;

    headerRow.deleteCell(columnIndex);
    for (let row of tableBody.rows) {
        row.deleteCell(columnIndex);
    }
};

// ✅ **Asset verwijderen**
window.removeRow = function (button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
};

// ✅ **Timeframe dropdown blijft ongewijzigd**
document.getElementById('globalTimeframe').addEventListener('change', function() {
    let newTimeframe = this.value;
    console.log(`✅ Timeframe veranderd naar ${newTimeframe}`);
});
