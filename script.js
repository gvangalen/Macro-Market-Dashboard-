document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM geladen!");

    if (typeof JustGage === "undefined" || typeof Raphael === "undefined") {
        console.error("❌ JustGage of Raphael is niet correct geladen!");
        return;
    }

    console.log("✅ JustGage en Raphael geladen!");

    let macroGauge = new JustGage({
        id: "macroGauge",
        value: 50,
        min: 0,
        max: 100,
        title: "Macro Trend",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    let technicalGauge = new JustGage({
        id: "technicalGauge",
        value: 70,
        min: 0,
        max: 100,
        title: "Technische Analyse",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    let setupGauge = new JustGage({
        id: "setupGauge",
        value: 30,
        min: 0,
        max: 100,
        title: "Huidige Setup",
        gaugeWidthScale: 0.6,
        levelColors: ["#FF5733", "#FFC300", "#4CAF50"],
    });

    console.log("📊 Meters succesvol geïnitialiseerd!");

    setTimeout(() => {
        macroGauge.refresh(65);
        technicalGauge.refresh(85);
        setupGauge.refresh(40);
        console.log("🔄 Meters geüpdatet met nieuwe waarden!");
    }, 2000);
});
    // 🔄 **Laad live data**
    async function fetchBTCDominance() {
        try {
            let response = await fetch("https://api.coingecko.com/api/v3/global");
            let data = await response.json();
            let btcDominance = data.data.market_cap_percentage.btc.toFixed(2);
            macroGauge.refresh(parseFloat(btcDominance));
            console.log("📊 BTC Dominantie:", btcDominance);
        } catch (error) {
            console.error("❌ Fout bij ophalen BTC Dominantie:", error);
        }
    }

    async function fetchFearGreedIndex() {
        try {
            let response = await fetch("https://api.alternative.me/fng/");
            let data = await response.json();
            let fearGreed = parseInt(data.data[0].value);
            setupGauge.refresh(fearGreed);
            console.log("📊 Fear & Greed Index:", fearGreed);
        } catch (error) {
            console.error("❌ Fout bij ophalen Fear & Greed Index:", error);
        }
    }

    async function fetchRSIBitcoin() {
        try {
            let response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT

");
            let data = await response.json();
            let priceChangePercent = Math.abs(parseFloat(data.priceChangePercent));  // Simpele proxy voor RSI
            technicalGauge.refresh(priceChangePercent);
            console.log("📊 RSI Bitcoin (proxy via prijsverandering):", priceChangePercent);
        } catch (error) {
            console.error("❌ Fout bij ophalen RSI Bitcoin:", error);
        }
    }

    // 🔄 **Alles tegelijk updaten**
    function updateAllGauges() {
        console.log("🔄 Data ophalen en meters updaten...");
        fetchBTCDominance();
        fetchFearGreedIndex();
        fetchRSIBitcoin();
    }

    // 🚀 **Eerste keer laden en daarna elke minuut updaten**
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
});
