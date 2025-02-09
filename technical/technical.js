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
    for (let i = 2; i < headerRow.cells.length - 1; i++) {
        let cell = headerRow.cells[i];
        if (!cell.querySelector("button")) {
            cell.innerHTML += ` <button class="btn-remove" onclick="removeTechIndicator(this)">❌</button>`;
        }
    }
}

// ✅ **Asset toevoegen**
window.addTechRow = function () {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return;

    let table = document.getElementById("analysisTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    // ✅ Timeframe uit dropdown halen
    let timeframe = document.getElementById('globalTimeframe').value;
    
    newRow.innerHTML = `
        <td>${assetName}</td>
        <td class='timeframe'>${timeframe}</td>
        <td><button class='btn-remove' onclick="removeRow(this)">❌</button></td>
    `;
};

// ✅ **Indicator toevoegen**
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

    // ✅ Nieuwe kolom toevoegen zonder extra rijen aan te maken
    let newHeader = document.createElement("th");
    newHeader.innerHTML = `${indicatorName} <button class="btn-remove" onclick="removeTechIndicator(this)">❌</button>`;
    headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 1]);

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

// ✅ **Timeframe veranderen voor de hele tabel**
document.getElementById('globalTimeframe').addEventListener('change', function() {
    let newTimeframe = this.value;
    let timeCells = document.querySelectorAll('.timeframe');

    timeCells.forEach(cell => {
        cell.textContent = newTimeframe;
    });

    console.log(`✅ Timeframe veranderd naar ${newTimeframe}`);
});
