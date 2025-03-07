document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");

    updateAllData();
    setInterval(updateAllData, 60000); // ✅ Elke minuut verversen

    // ✅ Event Listeners koppelen voor knoppen (met null-check)
    document.getElementById("addMacroIndicatorBtn")?.addEventListener("click", addMacroRow);
    document.getElementById("addTechnicalIndicatorBtn")?.addEventListener("click", addTechIndicator);
    document.getElementById("addTechAssetBtn")?.addEventListener("click", addTechRow);
});

// ✅ **Haalt ALLE data op vanaf AWS-server**
async function updateAllData() {
    try {
        const response = await fetch("http://13.60.235.90:5002/market_data");
        if (!response.ok) throw new Error(`Fout bij ophalen marktdata: ${response.status}`);
        
        const data = await response.json();
        console.log("📊 Ontvangen API-data:", data);

        // ✅ Update macro-indicatoren
        updateMacroData(data);

        // ✅ Update Bitcoin en Solana gegevens
        updateCryptoData("btc", data.crypto?.bitcoin);
        updateCryptoData("sol", data.crypto?.solana);
    } catch (error) {
        console.error("❌ Fout bij ophalen marktdata:", error);
        showError("macroStatus", "Fout bij ophalen data.");
    }
}

// ✅ **Macro Indicatoren Updaten**
function updateMacroData(data) {
    document.getElementById("googleTrends").innerText = data.fear_greed_index ?? "N/A";
    document.getElementById("usdtDominance").innerText = data.crypto?.bitcoin?.dominance
        ? `${data.crypto.bitcoin.dominance.toFixed(2)}%`
        : "N/A";
}

// ✅ **Crypto Data bijwerken (Bitcoin & Solana)**
function updateCryptoData(prefix, cryptoData) {
    if (!cryptoData) {
        showError(`${prefix}Close`, "N/A");
        showError(`${prefix}Change`, "N/A");
        showError(`${prefix}MarketCap`, "N/A");
        showError(`${prefix}Volume`, "N/A");
        return;
    }

    document.getElementById(`${prefix}Close`).innerText = `$${cryptoData.price.toFixed(2)}`;
    document.getElementById(`${prefix}Change`).innerText = `${cryptoData.change_24h.toFixed(2)}%`;
    document.getElementById(`${prefix}MarketCap`).innerText = `$${(cryptoData.market_cap / 1e9).toFixed(2)}B`;
    document.getElementById(`${prefix}Volume`).innerText = `$${(cryptoData.volume / 1e9).toFixed(2)}B`;

    // ✅ Kleur aanpassen op basis van stijging/daling
    document.getElementById(`${prefix}Change`).style.color = cryptoData.change_24h >= 0 ? "green" : "red";
}

// ✅ **Macro Indicator Toevoegen**
function addMacroRow() {
    let table = document.getElementById("macroTable")?.getElementsByTagName('tbody')[0];
    if (!table) return;

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

// ✅ **Verwijderknoppen activeren**
function updateRemoveButtons() {
    document.querySelectorAll(".btn-remove").forEach(button => {
        button.removeEventListener("click", removeRow); // Voorkomt dubbele events
        button.addEventListener("click", removeRow);
    });
}

// ✅ **Rij verwijderen**
function removeRow(event) {
    event.target.closest("tr").remove();
}

// ✅ **Foutmelding in UI tonen**
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerText = message;
        element.style.color = "red";
    }
}
