document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");

    // ✅ Start updates
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
});

// ✅ Functie om een nieuwe asset toe te voegen
function addTechRow() {
    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

    let assetId = `asset-${new Date().getTime()}`;  // Unieke ID voor asset

    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Asset" id="${assetId}"></td>
        <td><input type="text" placeholder="Timeframe"></td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td class="remove-cell"><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;

    newRow.setAttribute("data-asset-id", assetId);  // Bewaar ID van de asset
}

// ✅ Functie om een indicator toe te voegen aan een specifieke asset
function addTechIndicator() {
    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let rows = table.getElementsByTagName("tr");

    if (rows.length === 0) {
        alert("Voeg eerst een asset toe voordat je een indicator toevoegt.");
        return;
    }

    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    // ✅ Selecteer een asset om de indicator aan toe te voegen
    let assetOptions = Array.from(rows).map(row => {
        let assetInput = row.cells[0].querySelector("input");
        return assetInput ? assetInput.value : "Onbekende asset";
    });

    let assetSelection = prompt(`Voor welke asset wil je "${indicatorName}" toevoegen?\n${assetOptions.join("\n")}`);
    if (!assetSelection || !assetOptions.includes(assetSelection)) {
        alert("Ongeldige asset geselecteerd.");
        return;
    }

    // ✅ Zoek de juiste asset-rij en voeg de indicator toe vóór de "Verwijderen"-kolom
    for (let row of rows) {
        let assetInput = row.cells[0].querySelector("input");
        if (assetInput && assetInput.value === assetSelection) {
            let removeCellIndex = row.cells.length - 1;  // Laatste kolom is "Verwijderen"
            let newCell = row.insertCell(removeCellIndex);
            newCell.innerHTML = `${indicatorName} <button class="btn-remove" onclick="removeIndicator(this)">❌</button>`;
            return;
        }
    }
}

// ✅ Functie om een specifieke indicator te verwijderen
function removeIndicator(button) {
    let cell = button.parentNode;
    cell.parentNode.removeChild(cell);
}

// ✅ Functie om een asset-rij te verwijderen
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

// 🔄 **Alles updaten**
function updateAllGauges() {
    console.log("🔄 Data ophalen en meters updaten...");
    fetchGoogleTrends();
    fetchFearGreedIndex();
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

// ✅ **Bitcoin RSI (proxy via prijsverandering)**
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
window.addTechRow = addTechRow;
window.addTechIndicator = addTechIndicator;

// ✅ **Start updates bij laden**
window.onload = function() {
    console.log("✅ Window onload functie geactiveerd!");
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
};
