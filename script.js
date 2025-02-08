document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");

    // ✅ Start updates
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
});

// ✅ Asset toevoegen
function addTechRow() {
    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    
    // Voeg standaard kolommen toe, waarbij de laatste kolom "Verwijderen" is
    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Asset"></td>
        <td><input type="text" placeholder="Timeframe"></td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;
}

// ✅ Indicator toevoegen voor een specifieke asset
function addTechIndicator() {
    let assetRows = document.getElementById("techTable").getElementsByTagName('tbody')[0].rows;
    if (assetRows.length === 0) {
        alert("Voeg eerst een asset toe voordat je een indicator toevoegt.");
        return;
    }
    
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;
    
    let assetNames = [];
    for (let row of assetRows) {
        let assetName = row.cells[0].querySelector('input').value || "Onbekend";
        assetNames.push(assetName);
    }
    
    let selectedAsset = prompt(`Voor welke asset wil je "${indicatorName}" toevoegen?\n${assetNames.join("\n")}`);
    if (!selectedAsset || !assetNames.includes(selectedAsset)) {
        alert("Ongeldige asset gekozen.");
        return;
    }
    
    for (let row of assetRows) {
        let assetInput = row.cells[0].querySelector('input');
        if (assetInput.value === selectedAsset) {
            let newCell = row.insertCell(row.cells.length - 1); // Voorlaatste kolom
            newCell.innerHTML = `${indicatorName} <button class="btn-remove" onclick="removeCell(this)">❌</button>`;
        }
    }
}

// ✅ Verwijder een cel (indicator) uit een asset
function removeCell(button) {
    let cell = button.parentNode;
    cell.parentNode.removeChild(cell);
}

// ✅ Rij verwijderen (asset of indicator)
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
