document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    ensureTechButtons();
});

// ✅ Zorg ervoor dat elke rij en kolom een verwijderknop heeft
function ensureTechButtons() {
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];

    // ✅ Verwijderknoppen voor elke asset (rij)
    for (let row of tableBody.rows) {
        let lastCell = row.cells[row.cells.length - 1];
        if (!lastCell.querySelector("button")) {
            lastCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
        }
    }

    // ✅ Verwijderknoppen voor indicatoren (kolommen)
    for (let i = 2; i < headerRow.cells.length - 1; i++) {
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

// ✅ **Asset toevoegen zonder extra kolommen**
window.addTechRow = function () {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return;

    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];
    let newRow = tableBody.insertRow();

    // ✅ Timeframe dropdown aanmaken
    let timeframeCell = newRow.insertCell(1);
    let timeframeSelect = document.createElement("select");
    let timeframeOptions = ["1hr", "4hr", "1day", "1week"];

    timeframeOptions.forEach(option => {
        let opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        timeframeSelect.appendChild(opt);
    });

    // ✅ Vul de rij correct met het juiste aantal cellen
    newRow.insertCell(0).innerText = assetName; // Asset naam
    timeframeCell.appendChild(timeframeSelect); // Timeframe dropdown

    let columnCount = document.getElementById("techTable").rows[0].cells.length;
    for (let i = 2; i < columnCount - 1; i++) {
        newRow.insertCell(i).innerHTML = "Laden...";
    }

    // ✅ Voeg standaard de verwijderknop toe
    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
};

// ✅ **Indicator toevoegen zonder extra rijen**
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

// ✅ **Indicator verwijderen zonder extra problemen**
window.removeTechIndicator = function (button) {
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];

    let columnIndex = button.parentNode.cellIndex;

    headerRow.deleteCell(columnIndex);
    for (let row of tableBody.rows) {
        row.deleteCell(columnIndex);
    }
};

// ✅ **Rij verwijderen (asset) zonder extra problemen**
window.removeRow = function (button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
};
