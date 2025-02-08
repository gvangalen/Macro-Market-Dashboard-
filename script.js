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

const apiKey = "CG-5i5Ak7f99kCCPHaRwa7xSrW4";  // Zet hier jouw echte API key!

async function fetchBTCDominance() {
    const url = "https://api.coingecko.com/api/v3/global";
    
    const options = {
        method: "GET",
        headers: {
            "x-cg-demo-api-key": "CG-5i5Ak7f99kCCPHaRwa7rW4", // Voeg hier jouw API-key toe
            "Accept": "application/json"
        }
    };

    try {
        let response = await fetch(url, options);
        let data = await response.json();
        let btcDominance = parseFloat(data.data.market_cap_percentage.btc.toFixed(2));

        if (macroGauge) macroGauge.refresh(btcDominance);
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
async function fetchGoogleTrends() {
    const url = 'https://google-trends8.p.rapidapi.com/trendings?region_code=NL&hl=nl-NL';

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'b78636a22cmsh7f068b3613a3c54p1ba923jsn1f119b970bef', // JOUW API KEY
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

        // ✅ Check of 'trendingSearches' bestaat in de response
        if (!data || !data.trendingSearches) {
            throw new Error("📛 API response is niet correct!");
        }

        // ✅ Zoek of 'Bitcoin' voorkomt in trending topics
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
// 🔄 **Alles tegelijk updaten**
function updateAllGauges() {
    console.log("🔄 Data ophalen en meters updaten...");
    fetchBTCDominance();
    fetchFearGreedIndex();
    fetchRSIBitcoin();
    fetchBitcoinData();
    fetchGoogleTrends();
}
// ✅ Functie om een macro-indicator toe te voegen
function addMacroRow() {
    let table = document.getElementById("macroTable").getElementsByTagName('tbody')[0];
    let row = table.insertRow();

    row.innerHTML = `
        <td><input type="text" placeholder="Naam Indicator"></td>
        <td>Laden...</td>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
        <td><button onclick="removeRow(this)">❌</button></td>
    `;
}

// ✅ Functie om een technische analyse asset toe te voegen
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

// ✅ Functie om een rij te verwijderen
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

// ✅ Functie om een nieuwe asset toe te voegen
function addTechRow() {
    let table = document.getElementById("techTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    
    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Asset"></td>
        <td><input type="text" placeholder="Timeframe"></td>
        <td><input type="text" placeholder="RSI"></td>
        <td><input type="text" placeholder="ATR-Model"></td>
        <td><input type="text" placeholder="Volume (24u)"></td>
        <td><input type="text" placeholder="Volume Trend"></td>
        <td><input type="text" placeholder="200MA"></td>
        <td><input type="text" placeholder="Positie t.o.v. 200MA"></td>
        <td><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;
}

// ✅ Functie om een nieuwe indicator toe te voegen
function addTechIndicator() {
    let table = document.getElementById("techIndicatorsTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    
    newRow.innerHTML = `
        <td><input type="text" placeholder="Naam Indicator"></td>
        <td><input type="text" placeholder="Waarde"></td>
        <td><button class="btn-remove" onclick="removeRow(this)">❌</button></td>
    `;
}

// ✅ Functie om rijen (assets of indicatoren) te verwijderen
function removeRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

window.onload = function() {
    console.log("✅ Window onload functie geactiveerd!");
    fetchBitcoinData();  // Voeg deze regel toe
    updateAllGauges();
    setInterval(updateAllGauges, 60000);
    setInterval(fetchBitcoinData, 60000); // Elke minuut Bitcoin data verversen
};
