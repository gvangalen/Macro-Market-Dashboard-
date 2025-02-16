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
        if (!response.ok) throw new Error("Fout bij ophalen market data");
        let data = await response.json();
        console.log("📊 Ontvangen API-data:", data);

        // ✅ Update macro-indicatoren
        document.getElementById("googleTrends").innerText = data.fear_greed_index;
        document.getElementById("usdtDominance").innerText = `${data.crypto.bitcoin.dominance.toFixed(2)}%`;

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
    document.getElementById(`${prefix}MarketCap`).innerText = `$${(cryptoData.market_cap / 1e9).toFixed(2)}B`;
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

// ✅ **Verwijderknoppen bijwerken**
function updateRemoveButtons() {
    document.querySelectorAll(".btn-remove").forEach(button => {
        button.addEventListener("click", removeRow);
    });
}
