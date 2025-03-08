import { API_BASE_URL } from "../config.js"; // ✅ Gebruik centrale API-config

console.log("✅ dashboard.js correct geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Dashboard geladen!");
    updateAllData();
    setInterval(updateAllData, 60000); // ✅ Elke minuut verversen

    // ✅ Event Listeners koppelen met null-checks
    document.getElementById("addMacroIndicatorBtn")?.addEventListener("click", addMacroRow);
    document.getElementById("addTechnicalIndicatorBtn")?.addEventListener("click", addTechIndicator);
    document.getElementById("addTechAssetBtn")?.addEventListener("click", addTechRow);
});

// ✅ **Helperfunctie voor veilige API-aanvragen met retry**
async function safeFetch(url) {
    let retries = 3;
    while (retries > 0) {
        try {
            let response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error(`Fout bij ophalen data van ${url}`);

            let data = await response.json();
            if (!data || Object.keys(data).length === 0) {
                throw new Error(`Lege of ongeldige data ontvangen van ${url}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) return null;
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec wachten
        }
    }
}

// ✅ **Haalt ALLE data op vanaf AWS-server**
async function updateAllData() {
    let data = await safeFetch("/market_data");
    if (!data || !data.crypto) {
        return showError("macroStatus", "Fout bij ophalen data.");
    }

    console.log("📊 Ontvangen API-data:", data);

    updateMacroData(data);
    updateCryptoUI(data.crypto);
}

// ✅ **Macro Indicatoren Updaten**
function updateMacroData(data) {
    setText("googleTrends", data.fear_greed_index ?? "N/A");
    setText("usdtDominance", data.crypto?.bitcoin?.dominance
        ? `${data.crypto.bitcoin.dominance.toFixed(2)}%`
        : "N/A"
    );
}

// ✅ **Crypto Data bijwerken voor ALLE assets**
function updateCryptoUI(cryptoData) {
    Object.keys(cryptoData).forEach(coin => {
        let elements = document.querySelectorAll(`[data-coin="${coin}"]`);
        if (elements.length === 0) {
            console.warn(`⚠️ Geen HTML-elementen voor ${coin} gevonden.`);
            return;
        }

        let data = cryptoData[coin];
        elements.forEach(el => {
            let type = el.dataset.type;
            if (type === "price") setText(el.id, `$${data.price.toFixed(2)}`);
            if (type === "volume") setText(el.id, `📈 Volume: ${formatNumber(data.volume)}`);
            if (type === "change") {
                setText(el.id, `${data.change_24h.toFixed(2)}%`);
                el.style.color = data.change_24h >= 0 ? "green" : "red";
            }
        });
    });
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

// ✅ **Helperfunctie voor tekst in een element**
function setText(elementId, text) {
    let el = typeof elementId === "string" ? document.getElementById(elementId) : elementId;
    if (el) el.innerText = text;
}

// ✅ **Hulpfunctie voor grote getallen (M = miljoen, B = miljard)**
function formatNumber(num) {
    return num >= 1e9
        ? `${(num / 1e9).toFixed(2)}B`
        : num >= 1e6
        ? `${(num / 1e6).toFixed(2)}M`
        : num.toLocaleString();
}
