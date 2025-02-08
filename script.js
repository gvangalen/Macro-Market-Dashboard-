let macroGauge, technicalGauge, setupGauge;  // 🔹 Globale variabelen

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

// ✅ Google Trends ophalen
async function fetchGoogleTrends() {
    const url = 'https://google-trends8.p.rapidapi.com/trendings?region_code=NL&hl=nl-NL';

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'JOUW_API_KEY_HIER',
            'X-RapidAPI-Host': 'google-trends8.p.rapidapi.com'
        }
    };

    try {
        let response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        let data = await response.json();
        console.log("📊 Google Trends Data:", data);

        if (!data || !data.trendingSearches) {
            throw new Error("📛 API response is niet correct!");
        }

        let bitcoinTrend = data.trendingSearches.find(item => item.title.toLowerCase().includes("bitcoin"));

        if (bitcoinTrend) {
            let trendScore = bitcoinTrend.traffic;
            document.getElementById("googleTrends").innerText = `📈 Bitcoin trending! Score: ${trendScore}`;
        } else {
            document.getElementById("googleTrends").innerText = "❌ Geen Bitcoin trend gevonden.";
        }
    } catch (error) {
        console.error("❌ Fout bij ophalen Google Trends:", error);
        document.getElementById("googleTrends").innerText = "❌ Fout bij ophalen.";
    }
}

// ✅ Fear & Greed Index ophalen
async function fetchFearGreedIndex() {
    try {
        let response = await fetch("https://api.alternative.me/fng/");
        let data = await response.json();
        let fearGreed = parseInt(data.data[0].value);

        document.getElementById("fearGreed").innerText = fearGreed;
        if (setupGauge) setupGauge.refresh(fearGreed);
    } catch (error) {
        console.error("❌ Fout bij ophalen Fear & Greed Index:", error);
    }
}

// ✅ BTC Dominantie ophalen
async function fetchBTCDominance() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/global");
        let data = await response.json();
        let btcDominance = parseFloat(data.data.market_cap_percentage.btc.toFixed(2));

        document.getElementById("usdtDominance").innerText = btcDominance + "%";
        if (macroGauge) macroGauge.refresh(btcDominance);
    } catch (error) {
        console.error("❌ Fout bij ophalen BTC Dominantie:", error);
    }
}

// ✅ Bitcoin RSI (proxy via prijsverandering)
async function fetchRSIBitcoin() {
    try {
        let response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
        let data = await response.json();
        let priceChangePercent = Math.abs(parseFloat(data.priceChangePercent));

        document.getElementById("rsiBitcoin").innerText = priceChangePercent;
        if (technicalGauge) technicalGauge.refresh(priceChangePercent);
    } catch (error) {
        console.error("❌ Fout bij ophalen RSI Bitcoin:", error);
    }
}

// ✅ Bitcoin Data ophalen
async function fetchBitcoinData() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true");
        let data = await response.json();
        let btc = data.bitcoin;

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
    fetchGoogleTrends();
    fetchFearGreedIndex();
    fetchBTCDominance();
    fetchRSIBitcoin();
    fetchBitcoinData();
}

// ✅ Functie om een technische indicator toe te voegen
function addTechIndicator() {
    let table = document.getElementById("techIndicatorsTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    
    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Indicator"></td>
        <td><input type="text" placeholder="Waarde"></td>
        <td><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;
}

// ✅ Functie om een asset toe te voegen
function addTechRow() {
    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let row = table.insertRow();

    row.innerHTML = `
        <td><input type="text" placeholder="Asset"></td>
        <td><input type="text" placeholder="Timeframe"></td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td>Laden...</td>
        <td><button onclick="removeRow(this)">❌</button></td>
    `;
}

// ✅ Functie om een rij te verwijderen
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

// ✅ Start automatische updates
window.onload = function() {
    console.log("✅ Window onload functie geactiveerd!");
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
};
