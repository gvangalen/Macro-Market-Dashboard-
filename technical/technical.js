import { API_BASE_URL } from "../config.js"; // ✅ API-config ophalen

console.log("✅ technical.js geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    loadTechAnalysis();
    setInterval(loadTechAnalysis, 60000); // 🔄 Elke minuut updaten
});

const apiUrl = `${API_BASE_URL}/technical_data`;

// ✅ **Technische Analyse laden vanaf AWS**
async function loadTechAnalysis() {
    setText("techStatus", "📡 Laden...");

    try {
        let data = await safeFetch(apiUrl);
        if (!data || !data.symbol) throw new Error("Ongeldige API-response");

        console.log("📊 Ontvangen technische analyse data:", data);
        renderTechTable([data]); // ✅ Alleen de meest recente data tonen
        setText("techStatus", "✅ Data up-to-date");
    } catch (error) {
        showError("techStatus", "❌ Fout bij laden.");
    }
}

// ✅ **Tabel vullen met data**
function renderTechTable(assets) {
    let tableBody = document.querySelector("#analysisTable tbody");
    tableBody.innerHTML = "";

    assets.forEach(asset => {
        let newRow = document.createElement("tr");
        newRow.dataset.id = asset.id; // ✅ dataset ID voor verwijderen

        let score = calculateTechScore(asset);
        let trend = score >= 1 ? "Bullish 📈" : score <= -1 ? "Bearish 📉" : "Neutraal ⚖️";

        newRow.innerHTML = `
            <td>${asset.symbol}</td>
            <td>${asset.rsi.toFixed(2)}</td>
            <td>${formatNumber(asset.volume)}</td>
            <td>${formatNumber(asset.ma_200)}</td>
            <td class="tech-score">${score}</td>
            <td>${trend}</td>
            <td><button class="btn-remove">❌</button></td>
        `;

        tableBody.appendChild(newRow);
    });

    attachDeleteEventListeners();
}

// ✅ **Score berekenen voor technische indicatoren**
function calculateTechScore(asset) {
    let score = 0;

    if (asset.rsi > 70) score -= 2;
    else if (asset.rsi > 55) score -= 1;
    else if (asset.rsi < 30) score += 2;
    else if (asset.rsi < 45) score += 1;

    if (asset.volume > 1_000_000_000) score += 1;
    if (asset.ma_200 < asset.price) score += 1;
    else score -= 1;

    return Math.max(-2, Math.min(2, score));
}

// ✅ **Asset toevoegen met indicatoren**
async function addTechRow() {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName || assetName.trim() === "") return alert("⚠️ Ongeldige naam!");

    await updateButton("addTechAssetBtn", "⏳ Toevoegen...", async () => {
        await safeFetch(apiUrl, "POST", { symbol: assetName.trim() });
        loadTechAnalysis();
    });
}

// ✅ **Indicator toevoegen aan alle assets**
async function addTechIndicator() {
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName || indicatorName.trim() === "") return alert("⚠️ Ongeldige naam!");

    await updateButton("addTechnicalIndicatorBtn", "⏳ Toevoegen...", async () => {
        await safeFetch(`${apiUrl}/indicators`, "POST", { name: indicatorName.trim() });
        loadTechAnalysis();
    });
}

// ✅ **Asset verwijderen**
async function removeTechRow(assetId) {
    if (!confirm("Weet je zeker dat je deze asset wilt verwijderen?")) return;

    await updateButton(`remove-${assetId}`, "⏳ Verwijderen...", async () => {
        await safeFetch(`${apiUrl}/${assetId}`, "DELETE");
        loadTechAnalysis();
    });
}

// ✅ **Veilige API-aanroepen met retry**
async function safeFetch(url, method = "GET", body = null) {
    let retries = 3;
    while (retries > 0) {
        try {
            let options = { method, headers: { "Content-Type": "application/json" } };
            if (body) options.body = JSON.stringify(body);

            let response = await fetch(url, options);
            if (!response.ok) throw new Error(`Serverfout (${response.status})`);

            return method === "GET" ? await response.json() : true;
        } catch (error) {
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// ✅ **Tekst aanpassen in UI**
function setText(elementId, text) {
    let el = document.getElementById(elementId);
    if (el) el.textContent = text;
}

// ✅ **Foutmelding tonen in UI**
function showError(elementId, message) {
    setText(elementId, message);
    document.getElementById(elementId).style.color = "red";
}

// ✅ **Knop tijdelijk aanpassen bij async bewerking**
async function updateButton(buttonId, tempText, action) {
    let button = document.getElementById(buttonId);
    if (!button) return;

    let originalText = button.textContent;
    button.textContent = tempText;
    button.disabled = true;

    try {
        await action();
    } catch (error) {
        console.error(error);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// ✅ **Event Listeners koppelen voor verwijderen**
function attachDeleteEventListeners() {
    document.querySelectorAll(".btn-remove").forEach(button => {
        button.removeEventListener("click", handleDeleteClick);
        button.addEventListener("click", handleDeleteClick);
    });
}

// ✅ **Afhandelen van verwijderen**
function handleDeleteClick(event) {
    let assetId = event.target.closest("tr").dataset.id;
    if (assetId) removeTechRow(assetId);
}

// ✅ **Helper: Getal formatteren**
function formatNumber(num) {
    return num >= 1e9
        ? `${(num / 1e9).toFixed(2)}B`
        : num >= 1e6
        ? `${(num / 1e6).toFixed(2)}M`
        : num.toFixed(2);
}
