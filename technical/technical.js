document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    ensureTechIndicatorRemoveButtons();
});

// ✅ Voeg verwijderknoppen toe aan bestaande indicatoren
function ensureTechIndicatorRemoveButtons() {
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];

    for (let i = 2; i < headerRow.cells.length - 1; i++) { // Indicatoren vanaf RSI tot 200MA
        let cell = headerRow.cells[i];

        if (!cell.querySelector("button")) {
            let removeButton = document.createElement("button");
            removeButton.innerHTML = "❌";
            removeButton.classList.add("btn-remove");
            removeButton.onclick = function () { removeTechIndicatorByIndex(i); };
            cell.appendChild(removeButton);
        }
    }
}

// ✅ Indicator verwijderen uit alle assets op basis van kolomindex
function removeTechIndicatorByIndex(index) {
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];

    headerRow.deleteCell(index);

    for (let row of tableBody.rows) {
        row.deleteCell(index);
    }

    ensureTechIndicatorRemoveButtons();
}

// ✅ **Asset toevoegen via pop-up**
function addTechRow() {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return;

    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    
    // ✅ Timeframe dropdown
    let timeframeOptions = ["1hr", "4hr", "1day", "1week"];
    let timeframeSelect = document.createElement("select");
    timeframeOptions.forEach(option => {
        let opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        timeframeSelect.appendChild(opt);
    });

    // ✅ Voeg cellen toe aan de rij
    newRow.insertCell(0).innerText = assetName;
    let timeframeCell = newRow.insertCell(1);
    timeframeCell.appendChild(timeframeSelect);
    
    for (let i = 2; i < 8; i++) {
        newRow.insertCell(i).innerHTML = "Laden...";
    }

    // ✅ Voeg de "Verwijderen"-knop toe
    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
}

// ✅ **Indicator toevoegen voor alle assets**
function addTechIndicator() {
    let table = document.getElementById("techTable");
    let headerRow = table.getElementsByTagName("thead")[0].rows[0];
    let bodyRows = table.getElementsByTagName("tbody")[0].rows;

    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    for (let cell of headerRow.cells) {
        if (cell.textContent.includes(indicatorName)) {
            alert("Deze indicator bestaat al!");
            return;
        }
    }

    // ✅ Nieuwe kolom toevoegen
    let newHeader = document.createElement("th");
    newHeader.innerHTML = `${indicatorName} <button class="btn-remove" onclick="removeTechIndicator(this)">❌</button>`;
    headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 1]);

    for (let row of bodyRows) {
        let newCell = row.insertCell(row.cells.length - 1);
        newCell.innerHTML = "Laden...";
    }
}

// ✅ **Indicator verwijderen uit ALLE assets**
function removeTechIndicator(button) {
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];

    let columnIndex = button.parentNode.cellIndex;

    headerRow.deleteCell(columnIndex);

    for (let row of tableBody.rows) {
        row.deleteCell(columnIndex);
    }
}

// ✅ **Rij verwijderen (asset)**
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}
