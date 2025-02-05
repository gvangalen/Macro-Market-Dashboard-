document.addEventListener("DOMContentLoaded", function () {
    if (typeof JustGage === "undefined") {
        console.error("JustGage is niet correct geladen!");
        return;
    }

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

    // Simuleer updates
    setTimeout(() => {
        macroGauge.refresh(65);
        technicalGauge.refresh(85);
        setupGauge.refresh(40);
    }, 2000);
});

    // 🔄 Functie om BTC Dominantie te laden
    async function fetchBTCDominance() {
        try {
            let response = await fetch("https://api.coingecko.com/api/v3/global");
            let data = await response.json();
            let btcDominance = data.data.market_cap_percentage.btc.toFixed(2);
            macroGauge.refresh(parseFloat(btcDominance));
        } catch (error) {
            console.error("⚠️ Fout bij ophalen BTC Dominantie:", error);
        }
    }

    // 🔄 Functie om Fear & Greed Index te laden
    async function fetchFearGreedIndex() {
        try {
            let response = await fetch("https://api.alternative.me/fng/");
            let data = await response.json();
            let fearGreed = parseInt(data.data[0].value);
            setupGauge.refresh(fearGreed);
        } catch (error) {
            console.error("⚠️ Fout bij ophalen Fear & Greed Index:", error);
        }
    }

    // 🔄 Functie om RSI van Bitcoin te laden
    async function fetchRSIBitcoin() {
        try {
            let response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
            let data = await response.json();
            let priceChangePercent = Math.abs(parseFloat(data.priceChangePercent));  // Simpele proxy voor RSI
            technicalGauge.refresh(priceChangePercent);
        } catch (error) {
            console.error("⚠️ Fout bij ophalen RSI Bitcoin:", error);
        }
    }

    // 🔄 **Alles tegelijk updaten**
    function updateAllGauges() {
        fetchBTCDominance();
        fetchFearGreedIndex();
        fetchRSIBitcoin();
    }

    // 🚀 **Eerste keer laden en dan elke minuut updaten**
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
});
