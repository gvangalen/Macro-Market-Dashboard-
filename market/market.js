document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Market.js geladen!");

    // ✅ API URL van jouw AWS-server
    const apiUrl = "http://13.60.235.90:5002/market_data";

    // ✅ Elementen koppelen voor BTC & SOL
    const marketElements = {
        bitcoin: {
            open: document.getElementById("btcOpen"),
            high: document.getElementById("btcHigh"),
            low: document.getElementById("btcLow"),
            close: document.getElementById("btcClose"),
            change: document.getElementById("btcChange"),
        },
        solana: {
            open: document.getElementById("solOpen"),
            high: document.getElementById("solHigh"),
            low: document.getElementById("solLow"),
            close: document.getElementById("solClose"),
            change: document.getElementById("solChange"),
        }
    };

    // ✅ Data ophalen en HTML bijwerken
    fetchMarketData();

    // ✅ Elke 60 seconden de data updaten
    setInterval(fetchMarketData, 60000);

    async function fetchMarketData() {
        try {
            let response = await fetch(apiUrl);
            if (!response.ok) throw new Error("API-fout bij ophalen marktdata");

            let data = await response.json();
            console.log("📊 Marktdata ontvangen:", data);

            if (!data.crypto) throw new Error("❌ Fout: Geen crypto-data beschikbaar!");

            // ✅ Update alle crypto's (momenteel BTC en SOL)
            Object.keys(marketElements).forEach(coin => {
                if (data.crypto[coin]) {
                    updateMarketData(marketElements[coin], data.crypto[coin]);
                } else {
                    console.warn(`⚠️ Geen data voor ${coin} ontvangen`);
                }
            });
        } catch (error) {
            console.error("❌ API-fout:", error);
            showErrorState();
        }
    }

    // ✅ **Marktdata updaten**
    function updateMarketData(elements, data) {
        elements.open.textContent = `$${data.price.toFixed(2)}`;
        elements.high.textContent = `📈 Volume: ${formatNumber(data.volume)}`;
        elements.low.textContent = `📉 24h Change: ${data.change_24h.toFixed(2)}%`;
        elements.close.textContent = "N/A"; // Geen duidelijke 'close' beschikbaar
        elements.change.textContent = `${data.change_24h.toFixed(2)}%`;
        
        // ✅ **Dynamische kleurverandering**
        elements.change.style.color = data.change_24h >= 0 ? "green" : "red";
    }

    // ✅ **Noodoplossing als API niet werkt**
    function showErrorState() {
        Object.values(marketElements).forEach(elements => {
            Object.values(elements).forEach(el => el.textContent = "⚠️ Error");
        });
    }

    // ✅ **Hulpfunctie voor grote getallen**
    function formatNumber(num) {
        return num >= 1e9
            ? `${(num / 1e9).toFixed(2)}B`
            : num >= 1e6
            ? `${(num / 1e6).toFixed(2)}M`
            : num.toLocaleString();
    }
});
