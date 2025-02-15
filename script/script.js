document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");
    updateAllData();
    setInterval(updateAllData, 60000); // Elke minuut verversen

    // ✅ Event Listeners koppelen voor knoppen
    document.getElementById("addMacroIndicatorBtn")?.addEventListener("click", addMacroRow);
    document.getElementById("addTechnicalIndicatorBtn")?.addEventListener("click", addTechIndicator);
    document.getElementById("addTechAssetBtn")?.addEventListener("click", addTechRow);
});

// ✅ **Update alle data vanaf de AWS-server**
async function updateAllData() {
    try {
        let response = await fetch("http://13.60.235.90:5002/market_data");
        let data = await response.json();
        console.log("📊 Ontvangen API-data:", data);

        // ✅ Update macro-indicatoren
        document.getElementById("googleTrends").innerText = data.fear_greed_index;
        document.getElementById("usdtDominance").innerText = `${data.crypto.bitcoin.volume.toLocaleString()}%`;

        // ✅ Update Bitcoin en Solana gegevens
        updateCryptoData("btc", data.crypto.bitcoin);
        updateCryptoData("sol", data.crypto.solana);
    } catch (error) {
        console.error("❌ Fout bij ophalen market data van AWS:", error);
    }
}

// ✅ **Crypto Data bijwerken (Bitcoin & Solana)**
function updateCryptoData(prefix, cryptoData) {
    document.getElementById(`${prefix}Close`).innerText = `$${cryptoData.price.toFixed(2)}`;
    document.getElementById(`${prefix}Change`).innerText = `${cryptoData.change_24h.toFixed(2)}%`;
    document.getElementById(`${prefix}MarketCap`).innerText = `$${(cryptoData.volume / 1e9).toFixed(2)}B`;
    document.getElementById(`${prefix}Volume`).innerText = `$${(cryptoData.volume / 1e9).toFixed(2)}B`;
    document.getElementById(`${prefix}Change`).style.color = cryptoData.change_24h >= 0 ? "green" : "red";
}

// ✅ **Macro Indicator Toevoegen**
function addMacroRow() {
    let table = document.getElementById("macroTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Indicator"></td>
        <td>Laden...</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td><button class="btn-remove">❌</button></td>
    `;
    updateRemoveButtons();
}

// ✅ **Technische Indicator Toevoegen**
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

    let newHeader = document.createElement("th");
    newHeader.innerHTML = `${indicatorName} <button class="btn-remove">❌</button>`;
    headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 1]);

    for (let row of bodyRows) {
        let newCell = row.insertCell(row.cells.length - 1);
        newCell.innerHTML = "Laden...";
    }
    updateRemoveButtons();
}

// ✅ **Rij verwijderen (macro/technisch)**
function removeRow(event) {
    let row = event.target.closest("tr");
    row.remove();
}

// ✅ **Asset toevoegen**
function addTechRow() {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return;

    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    let timeframeOptions = ["1hr", "4hr", "1day", "1week"];
    let timeframeSelect = document.createElement("select");
    timeframeOptions.forEach(option => {
        let opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        timeframeSelect.appendChild(opt);
    });

    newRow.insertCell(0).innerText = assetName;
    let timeframeCell = newRow.insertCell(1);
    timeframeCell.appendChild(timeframeSelect);
    
    for (let i = 2; i < 8; i++) {
        newRow.insertCell(i).innerHTML = "Laden...";
    }

    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove">❌</button>`;
    updateRemoveButtons();
}

// ✅ **Verwijderknoppen bijwerken**
function updateRemoveButtons() {
    document.querySelectorAll(".btn-remove").forEach(button => {
        button.addEventListener("click", function (event) {
            removeRow(event);
        });
    });
}
