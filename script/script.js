document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
    ensureMacroRemoveButtons();
    ensureTechIndicatorRemoveButtons(); // Fix: Bestaande technische indicatoren verwijderen
});

// ✅ Voeg verwijderknoppen toe aan ALLE bestaande technische indicatoren
function ensureTechIndicatorRemoveButtons() {
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];

    for (let i = 2; i < headerRow.cells.length - 1; i++) { // Begin na Asset en Timeframe
        let cell = headerRow.cells[i];

        // Controleer of er al een knop in de header staat
        if (!cell.querySelector("button")) {
            let removeButton = document.createElement("button");
            removeButton.innerHTML = "❌";
            removeButton.classList.add("btn-remove");
            removeButton.onclick = function () { removeTechIndicatorByIndex(i); };
            cell.appendChild(removeButton);
        }
    }
}

// ✅ Indicator verwijderen uit ALLE assets op basis van kolomindex
function removeTechIndicatorByIndex(index) {
    let headerRow = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0];
    let tableBody = document.getElementById("techTable").getElementsByTagName("tbody")[0];

    headerRow.deleteCell(index);

    for (let row of tableBody.rows) {
        row.deleteCell(index);
    }

    // **Herlaad de verwijderknoppen zodat alles correct blijft**
    ensureTechIndicatorRemoveButtons();
}

// ✅ **Asset toevoegen via een pop-up**
function addTechRow() {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return; // Stop als geen naam is ingevoerd

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
    
    for (let i = 2; i < 8; i++) { // Voeg lege cellen toe voor indicatoren
        newRow.insertCell(i).innerHTML = "Laden...";
    }

    // ✅ Voeg de "Verwijderen"-knop toe
    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove" onclick="removeRow(this)">❌</button>`;
}

// ✅ **Rij verwijderen (asset of macro-indicator)**
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

// ✅ **Indicator toevoegen voor ALLE assets**
function addTechIndicator() {
    let table = document.getElementById("techTable");
    let headerRow = table.getElementsByTagName("thead")[0].rows[0];
    let bodyRows = table.getElementsByTagName("tbody")[0].rows;

    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    // ✅ Controleer of indicator al bestaat
    for (let cell of headerRow.cells) {
        if (cell.textContent.includes(indicatorName)) {
            alert("Deze indicator bestaat al!");
            return;
        }
    }

    // ✅ Nieuwe kolom vóór de "Verwijderen"-kolom
    let newHeader = document.createElement("th");
    newHeader.innerHTML = `${indicatorName} <button class="btn-remove" onclick="removeTechIndicatorByIndex(${headerRow.cells.length - 1})">❌</button>`;
    headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 1]);

    // ✅ Voeg een lege cel toe voor deze indicator in elke asset-rij
    for (let row of bodyRows) {
        let newCell = row.insertCell(row.cells.length - 1);
        newCell.innerHTML = "Laden...";
    }

    // **Herlaad verwijderknoppen zodat alles correct blijft**
    ensureTechIndicatorRemoveButtons();
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
}

// ✅ **Bitcoin RSI ophalen**
async function fetchRSIBitcoin() {
    try {
        let response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
        let data = await response.json();
        let priceChangePercent = Math.abs(parseFloat(data.priceChangePercent));
        document.getElementById("rsiBitcoin").innerText = priceChangePercent;
    } catch (error) {
        console.error("❌ Fout bij ophalen RSI Bitcoin:", error);
    }
}

// ✅ **Bitcoin Data ophalen**
async function fetchBitcoinData() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true");
        let data = await response.json();
        let btc = data.bitcoin;

        document.getElementById("btcClose").innerText = `$${btc.usd.toLocaleString()}`;
        document.getElementById("btcChange").innerText = `${btc.usd_24h_change.toFixed(2)}%`;
        document.getElementById("btcMarketCap").innerText = `$${(btc.usd_market_cap / 1e9).toFixed(2)}B`;
        document.getElementById("btcVolume").innerText = `$${(btc.usd_24h_vol / 1e9).toFixed(2)}B`;
    } catch (error) {
        console.error("❌ Fout bij ophalen Bitcoin data:", error);
    }
}

// 🔄 **Alles updaten**
function updateAllGauges() {
    console.log("🔄 Data ophalen en meters updaten...");
    fetchGoogleTrends();
    fetchBTCDominance();
    fetchRSIBitcoin();
    fetchBitcoinData();
}

// ✅ **Start updates bij laden**
window.onload = function() {
    console.log("✅ Window onload functie geactiveerd!");
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
};
