import { API_BASE_URL } from "../config.js"; // ✅ Gebruik centrale API-config

console.log("✅ market.js correct geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Marktdata wordt geladen...");
    fetchMarketData();
    setInterval(fetchMarketData, 60000); // 🔄 Elke minuut updaten
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
            await new Promise(resolve => setTimeout(resolve, 2000)); // ⏳ 2 sec wachten
        }
    }
}

// ✅ **Marktdata ophalen en UI bijwerken**
async function fetchMarketData() {
    let data = await safeFetch("/market_data");
    if (!data || !Array.isArray(data)) {
        return showErrorState();
    }

    console.log("📊 Ontvangen API-marketdata:", data);

    updateMarketUI(data);
}

// ✅ **UI bijwerken met marktdata**
function updateMarketUI(marketData) {
    let marketContainer = document.getElementById("marketContainer");
    if (!marketContainer) {
        console.error("❌ HTML-element voor market data niet gevonden!");
        return;
    }

    marketContainer.innerHTML = ""; // ✅ Eerst leegmaken voor nieuwe data

    marketData.forEach(asset => {
        // Checken of de vereiste data aanwezig is
        if (asset.symbol && asset.price && asset.volume !== undefined && asset.change_24h !== undefined) {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${asset.symbol}</td>
                <td data-coin="${asset.symbol}" data-type="price">$${asset.price.toFixed(2)}</td>
                <td data-coin="${asset.symbol}" data-type="volume">📈 ${formatNumber(asset.volume)}</td>
                <td data-coin="${asset.symbol}" data-type="change" style="color: ${asset.change_24h >= 0 ? "green" : "red"}">
                    ${asset.change_24h.toFixed(2)}%
                </td>
            `;
            marketContainer.appendChild(row);
        } else {
            console.error("❌ Ongeldige data voor asset:", asset);
        }
    });
}

// ✅ **Fallback bij API-fout**
function showErrorState() {
    let marketContainer = document.getElementById("marketContainer");
    if (!marketContainer) return;
    
    marketContainer.innerHTML = `<tr><td colspan="4">⚠️ Fout bij laden van marktdata.</td></tr>`;
}

// ✅ **Hulpfunctie voor grote getallen (M = miljoen, B = miljard)**
function formatNumber(num) {
    return num >= 1e9
        ? `${(num / 1e9).toFixed(2)}B`
        : num >= 1e6
        ? `${(num / 1e6).toFixed(2)}M`
        : num.toLocaleString();
}
