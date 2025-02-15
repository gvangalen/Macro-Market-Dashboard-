document.addEventListener("DOMContentLoaded", function () {
    console.log("Market.js geladen ✅");

    // ✅ API URL van jouw AWS-server
    const apiUrl = "http://13.60.235.90:5002/market_data";

    // ✅ HTML-elementen koppelen
    const btcOpen = document.getElementById("btcOpen");
    const btcHigh = document.getElementById("btcHigh");
    const btcLow = document.getElementById("btcLow");
    const btcClose = document.getElementById("btcClose");
    const btcChange = document.getElementById("btcChange");
    
    const solOpen = document.getElementById("solOpen");
    const solHigh = document.getElementById("solHigh");
    const solLow = document.getElementById("solLow");
    const solClose = document.getElementById("solClose");
    const solChange = document.getElementById("solChange");

    // ✅ Haal market data op van AWS
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("📊 API Market Data ontvangen:", data);

            // ✅ Bitcoin Data
            const btcData = data.crypto.bitcoin;
            btcOpen.textContent = `$${btcData.price.toFixed(2)}`;
            btcHigh.textContent = `Volume: ${btcData.volume.toLocaleString()}`;
            btcLow.textContent = `24h Change: ${btcData.change_24h.toFixed(2)}%`;
            btcClose.textContent = "N/A";
            btcChange.textContent = `${btcData.change_24h.toFixed(2)}%`;
            btcChange.style.color = btcData.change_24h >= 0 ? "green" : "red";

            // ✅ Solana Data
            const solData = data.crypto.solana;
            solOpen.textContent = `$${solData.price.toFixed(2)}`;
            solHigh.textContent = `Volume: ${solData.volume.toLocaleString()}`;
            solLow.textContent = `24h Change: ${solData.change_24h.toFixed(2)}%`;
            solClose.textContent = "N/A";
            solChange.textContent = `${solData.change_24h.toFixed(2)}%`;
            solChange.style.color = solData.change_24h >= 0 ? "green" : "red";
        })
        .catch(error => {
            console.error("❌ Fout bij ophalen market data van AWS:", error);
            [btcOpen, btcHigh, btcLow, btcClose, btcChange, solOpen, solHigh, solLow, solClose, solChange]
                .forEach(el => el.textContent = "Error");
        });
});
