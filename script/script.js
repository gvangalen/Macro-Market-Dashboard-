document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");
    updateAllData();
    setInterval(updateAllData, 60000); // Elke minuut updaten

    // ✅ Event Listeners koppelen voor knoppen
    document.getElementById("addMacroIndicatorBtn")?.addEventListener("click", addMacroRow);
    document.getElementById("addTechnicalIndicatorBtn")?.addEventListener("click", addTechIndicator);
    document.getElementById("addTechAssetBtn")?.addEventListener("click", addTechRow);
});

// ✅ **Update alle data tegelijk**
function updateAllData() {
    console.log("🔄 Data ophalen en bijwerken...");
    fetchGoogleTrends();
    fetchBTCDominance();
    fetchRSIBitcoin();
    fetchBitcoinData();
}

// ✅ **Google Trends ophalen**
async function fetchGoogleTrends() {
    try {
        let response = await fetch("https://api.alternative.me/fng/");
        let data = await response.json();
        let fearGreed = parseInt(data.data[0].value);
        document.getElementById("googleTrends").innerText = fearGreed;
    } catch (error) {
        console.error("❌ Google Trends Error:", error);
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
        console.error("❌ BTC Dominantie Error:", error);
    }
}

// ✅ **RSI Bitcoin ophalen**
async function fetchRSIBitcoin() {
    try {
        let response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
        let data = await response.json();
        let priceChangePercent = Math.abs(parseFloat(data.priceChangePercent));
        document.getElementById("rsiBitcoin").innerText = priceChangePercent;
    } catch (error) {
        console.error("❌ RSI Bitcoin Error:", error);
    }
}

// ✅ **Bitcoin Marktgegevens ophalen**
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
        console.error("❌ Bitcoin Marktgegevens Error:", error);
    }
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

    // ✅ Controleer of indicator al bestaat
    for (let cell of headerRow.cells) {
        if (cell.textContent.includes(indicatorName)) {
            alert("Deze indicator bestaat al!");
            return;
        }
    }

    // ✅ Nieuwe kolom toevoegen
    let newHeader = document.createElement("th");
    newHeader.innerHTML = `${indicatorName} <button class="btn-remove">❌</button>`;
    headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 1]);

    // ✅ Lege cel toevoegen in elke rij
    for (let row of bodyRows) {
        let newCell = row.insertCell(row.cells.length - 1);
        newCell.innerHTML = "Laden...";
    }
    updateRemoveButtons();
}

// ✅ **Technische Indicator Verwijderen**
function removeTechIndicator(event) {
    let button = event.target;
    let columnIndex = button.closest("th").cellIndex;

    let table = document.getElementById("techTable");
    let headerRow = table.getElementsByTagName("thead")[0].rows[0];
    let bodyRows = table.getElementsByTagName("tbody")[0].rows;

    headerRow.deleteCell(columnIndex);
    for (let row of bodyRows) {
        row.deleteCell(columnIndex);
    }
}

// ✅ **Rij verwijderen (asset of macro-indicator)**
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

    // ✅ Verwijderknop toevoegen
    let deleteCell = newRow.insertCell(-1);
    deleteCell.innerHTML = `<button class="btn-remove">❌</button>`;
    updateRemoveButtons();
}

// ✅ **Event Listeners updaten**
function updateRemoveButtons() {
    document.querySelectorAll(".btn-remove").forEach(button => {
        button.addEventListener("click", function (event) {
            if (this.closest("tr")) {
                removeRow(event);
            } else {
                removeTechIndicator(event);
            }
        });
    });
}
