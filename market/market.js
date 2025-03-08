import { API_BASE_URL } from "../config.js"; // ✅ Gebruik centrale API-config

console.log("✅ market.js correct geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Marktdata wordt geladen...");
    fetchMarketData();
    setInterval(fetchMarketData, 60000); // Elke minuut updaten
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

// ✅ **Marktdata ophalen en UI bijwerken**
async function fetchMarketData() {
    let data = await safeFetch("/market_data");
    if (!data || !data.crypto) {
        return showErrorState();
    }

    console.log("📊 Ontvangen API-marketdata:", data);

    updateMarketUI(data.crypto);
}

// ✅ **UI bijwerken met marktdata**
function updateMarketUI(cryptoData) {
    Object.keys(cryptoData).forEach(coin => {
        let elements = document.querySelectorAll(`[data-coin="${coin}"]`);
        if (elements.length === 0) {
            console.warn(`⚠️ Geen HTML-elementen voor ${coin} gevonden.`);
            return;
        }

        let data = cryptoData[coin];
        elements.forEach(el => {
            let type = el.dataset.type;
            if (type === "price") el.textContent = `$${data.price.toFixed(2)}`;
            if (type === "volume") el.textContent = `📈 Volume: ${formatNumber(data.volume)}`;
            if (type === "change") {
                el.textContent = `${data.change_24h.toFixed(2)}%`;
                el.style.color = data.change_24h >= 0 ? "green" : "red";
            }
        });
    });
}

// ✅ **Fallback bij API-fout**
function showErrorState() {
    document.querySelectorAll("[data-coin]").forEach(el => {
        el.textContent = "⚠️ Error";
    });
}

// ✅ **Hulpfunctie voor grote getallen (M = miljoen, B = miljard)**
function formatNumber(num) {
    return num >= 1e9
        ? `${(num / 1e9).toFixed(2)}B`
        : num >= 1e6
        ? `${(num / 1e6).toFixed(2)}M`
        : num.toLocaleString();
}
