let macroGauge, technicalGauge, setupGauge;  // 🔹 Maak globale variabelen

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");

    if (typeof JustGage === "undefined" || typeof Raphael === "undefined") {
        console.error("❌ JustGage of Raphael is niet correct geladen!");
        return;
    }

    console.log("✅ JustGage en Raphael geladen!");

    // ✅ Maak de meters aan
    macroGauge = new JustGage({
        id: "macroGauge",
        value: 50,
        min: 0,
        max: 100,
        title: "Macro Trend",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    technicalGauge = new JustGage({
        id: "technicalGauge",
        value: 70,
        min: 0,
        max: 100,
        title: "Technische Analyse",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    setupGauge = new JustGage({
        id: "setupGauge",
        value: 30,
        min: 0,
        max: 100,
        title: "Huidige Setup",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    console.log("📊 Meters succesvol geïnitialiseerd!");

    // ✅ Start het updaten
    updateAllGauges();
    setInterval(updateAllGauges, 60000);  // Elke minuut updaten
});

// 🔄 **Live data ophalen en meters updaten**
async function fetchBTCDominance() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/global");
        let data = await response.json();
        let btcDominance = parseFloat(data.data.market_cap_percentage.btc.toFixed(2));
        console.log("📊 BTC Dominantie:", btcDominance);
        
        // ✅ Check of macroGauge bestaat voordat we refresh doen
        if (macroGauge) macroGauge.refresh(btcDominance);
    } catch (error) {
        console.error("❌ Fout bij ophalen BTC Dominantie:", error);
    }
}

async function fetchFearGreedIndex() {
    try {
        let response = await fetch("https://api.alternative.me/fng/");
        let data = await response.json();
        let fearGreed = parseInt(data.data[0].value);
        console.log("📊 Fear & Greed Index:", fearGreed);

        if (setupGauge) setupGauge.refresh(fearGreed);
    } catch (error) {
        console.error("❌ Fout bij ophalen Fear & Greed Index:", error);
    }
}

async function fetchRSIBitcoin() {
    try {
        let response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
        let data = await response.json();
        let priceChangePercent = Math.abs(parseFloat(data.priceChangePercent));  // Simpele proxy voor RSI
        console.log("📊 RSI Bitcoin (proxy via prijsverandering):", priceChangePercent);

        if (technicalGauge) technicalGauge.refresh(priceChangePercent);
    } catch (error) {
        console.error("❌ Fout bij ophalen RSI Bitcoin:", error);
    }
}

async function fetchBitcoinData() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true");
        let data = await response.json();
        let btc = data.bitcoin;

        document.getElementById("btcOpen").innerText = "N/A";  // API geeft geen open prijs, maar voorkomt error
        document.getElementById("btcHigh").innerText = "N/A";  // API geeft geen high prijs, maar voorkomt error
        document.getElementById("btcLow").innerText = "N/A";   // API geeft geen low prijs, maar voorkomt error
        document.getElementById("btcClose").innerText = `$${btc.usd.toLocaleString()}`;
        document.getElementById("btcChange").innerText = `${btc.usd_24h_change.toFixed(2)}%`;
        document.getElementById("btcMarketCap").innerText = `$${(btc.usd_market_cap / 1e9).toFixed(2)}B`;
        document.getElementById("btcVolume").innerText = `$${(btc.usd_24h_vol / 1e9).toFixed(2)}B`;

        console.log("📊 Bitcoin data geüpdatet:", data);
    } catch (error) {
        console.error("❌ Fout bij ophalen Bitcoin data:", error);
    }
}

// 🔄 **Alles tegelijk updaten**
function updateAllGauges() {
    console.log("🔄 Data ophalen en meters updaten...");
    fetchBTCDominance();
    fetchFearGreedIndex();
    fetchRSIBitcoin();
}

window.onload = function() {
    console.log("✅ Window onload functie geactiveerd!");
    fetchBitcoinData();  // Voeg deze regel toe
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
    setInterval(fetchBitcoinData, 60000); // Elke minuut Bitcoin data verversen
};
