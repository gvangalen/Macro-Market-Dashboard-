document.addEventListener("DOMContentLoaded", function() {
    if (typeof JustGage === "undefined") {
        console.error("JustGage is niet correct geladen!");
        return;
    }

    // Live Bitcoin data ophalen via CoinGecko API
    async function fetchBitcoinData() {
        try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true");
            const data = await response.json();
            const btc = data.bitcoin;

            document.getElementById("btcClose").innerText = `$${btc.usd.toLocaleString()}`;
            document.getElementById("btcChange").innerText = `${btc.usd_24h_change.toFixed(2)}%`;
            document.getElementById("btcMarketCap").innerText = `$${(btc.usd_market_cap / 1e9).toFixed(2)}B`;
            document.getElementById("btcVolume").innerText = `$${(btc.usd_24h_vol / 1e9).toFixed(2)}B`;
        } catch (error) {
            console.error("Fout bij ophalen Bitcoin data:", error);
        }
    }

    fetchBitcoinData();
    setInterval(fetchBitcoinData, 60000); // Elke minuut verversen

    // macroData.js

async function fetchMacroData() {
    try {
        // API Calls
        let dxyResponse = await fetch('https://www.alphavantage.co/query?function=DX.FX&apikey=YOUR_API_KEY');
        let us10yResponse = await fetch('https://www.alphavantage.co/query?function=US10Y&apikey=YOUR_API_KEY');
        let us2yResponse = await fetch('https://www.alphavantage.co/query?function=US2Y&apikey=YOUR_API_KEY');
        let etfResponse = await fetch('https://fintel.io/api/btc-etf-inflows');
        let fearGreedResponse = await fetch('https://api.alternative.me/fng/');
        let usdtResponse = await fetch('https://api.coingecko.com/api/v3/global');
        let googleTrendsResponse = await fetch('https://serpapi.com/search.json?q=Bitcoin+trends&api_key=YOUR_API_KEY');
        
        // JSON Parsing
        let dxyData = await dxyResponse.json();
        let us10yData = await us10yResponse.json();
        let us2yData = await us2yResponse.json();
        let etfData = await etfResponse.json();
        let fearGreedData = await fearGreedResponse.json();
        let usdtData = await usdtResponse.json();
        let googleTrendsData = await googleTrendsResponse.json();

        // Update HTML Elements
        document.getElementById("dxyIndex").innerText = dxyData.value || 'N/A';
        document.getElementById("us10y").innerText = us10yData.value || 'N/A';
        document.getElementById("us2y").innerText = us2yData.value || 'N/A';
        document.getElementById("etfFlows").innerText = etfData.inflows || 'N/A';
        document.getElementById("fearGreed").innerText = fearGreedData.data[0].value || 'N/A';
        document.getElementById("usdtDominance").innerText = usdtData.data.market_cap_percentage.usdt.toFixed(2) + "%" || 'N/A';
        document.getElementById("googleTrends").innerText = googleTrendsData.searches || 'N/A';
    } catch (error) {
        console.error("Error fetching macro data:", error);
    }
}

// Refresh data every 60 seconds
setInterval(fetchMacroData, 60000);
window.onload = fetchMacroData;

}
                          // Functie om trends visueel te maken
function updateTrendColor(elementId, value) {
    let element = document.getElementById(elementId);
    if (value > 0) {
        element.classList.add("green");
        element.classList.remove("red");
    } else {
        element.classList.add("red");
        element.classList.remove("green");
    }
}

// Voorbeeld bij US10Y rente
document.getElementById("us10y").innerText = us10yData.value || 'N/A';
updateTrendColor("us10y", us10yData.value);
                         );
