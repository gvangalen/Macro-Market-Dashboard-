document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    ensureTechButtons();
});

// ✅ Zorg ervoor dat elke rij en kolom standaard een verwijderknop heeft
function ensureTechButtons() {
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];

    // ✅ Voeg standaard verwijderknoppen toe aan assets (rijen)
    for (let row of tableBody.rows) {
        let lastCell = row.cells[row.cells.length - 1];
        if (!lastCell.querySelector("button")) {
            lastCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
        }
    }

    // ✅ Voeg standaard verwijderknoppen toe aan indicatoren (kolommen)
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

    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];
    let newRow = tableBody.insertRow();
    let columns = document.getElementById("techTable").rows[0].cells.length;

    // ✅ Voeg asset naam en timeframe dropdown toe
    newRow.insertCell(0).innerText = assetName;

    let timeframeCell = newRow.insertCell(1);
    let timeframeSelect = document.createElement("select");
    let timeframeOptions = ["1hr", "4hr", "1day", "1week"];

    timeframeOptions.forEach(option => {
        let opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        timeframeSelect.appendChild(opt);
    });

    timeframeCell.appendChild(timeframeSelect);

    // ✅ Vul de rest van de rij met "Laden..." voor bestaande indicatoren
    for (let i = 2; i < columns - 1; i++) {
        newRow.insertCell(i).innerHTML = "Laden...";
    }

    // ✅ Voeg standaard de verwijderknop toe
    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
};

// ✅ **Indicator toevoegen**
window.addTechIndicator = function () {
    let table = document.getElementById("techTable");
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

    // ✅ Nieuwe kolom toevoegen zonder extra rijen
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
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];

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
