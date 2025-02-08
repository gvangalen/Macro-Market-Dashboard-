document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");

    // ✅ Start updates
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
});

// ✅ **Asset toevoegen aan technische analyse**
function addTechRow() {
    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();

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

    // ✅ Dynamische indicatoren toevoegen aan de nieuwe asset-rij
    let headers = document.getElementById("techTable").getElementsByTagName("thead")[0].rows[0].cells;
    for (let i = 9; i < headers.length; i++) {  // 9 is startindex van extra indicatoren
        let newCell = newRow.insertCell(-1);
        newCell.innerHTML = "Laden...";
    }
}

// ✅ **Indicator toevoegen aan technische analyse**
function addTechIndicator() {
    let table = document.getElementById("techTable");
    let headerRow = table.getElementsByTagName("thead")[0].rows[0];
    let bodyRows = table.getElementsByTagName("tbody")[0].rows;

    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;

    // Voorkom dubbele indicatoren
    let existingHeaders = [...headerRow.cells].map(cell => cell.textContent.trim());
    if (existingHeaders.includes(indicatorName)) {
        alert("Deze indicator bestaat al!");
        return;
    }

    // ✅ Nieuwe kolom toevoegen aan de header
    let newHeader = document.createElement("th");
    newHeader.textContent = indicatorName;

    // ✅ Knop toevoegen om de indicator te verwijderen
    let removeButton = document.createElement("button");
    removeButton.textContent = "❌";
    removeButton.classList.add("btn-remove");
    removeButton.onclick = function () { removeTechIndicator(newHeader.cellIndex); };
    newHeader.appendChild(removeButton);
    
    headerRow.appendChild(newHeader);

    // ✅ Nieuwe kolom toevoegen aan elke bestaande asset-rij
    for (let row of bodyRows) {
        let newCell = row.insertCell(-1);
        newCell.innerHTML = "Laden...";
    }
}

// ✅ **Indicator verwijderen uit technische analyse**
function removeTechIndicator(index) {
    let table = document.getElementById("techTable");
    let headerRow = table.getElementsByTagName("thead")[0].rows[0];
    let bodyRows = table.getElementsByTagName("tbody")[0].rows;

    headerRow.deleteCell(index);
    for (let row of bodyRows) {
        row.deleteCell(index);
    }
}

// ✅ **Rij verwijderen (asset of indicator)**
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
