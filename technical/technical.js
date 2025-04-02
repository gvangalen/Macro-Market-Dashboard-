import { API_BASE_URL } from "../config.js"; // ✅ API-config ophalen

console.log("✅ technical.js geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    loadTechAnalysis();
    setInterval(loadTechAnalysis, 60000); // 🔄 Elke minuut updaten
});

const baseUrl = `${API_BASE_URL}/technical_data`;  // ✅ Basis URL

// ✅ Technische Analyse ophalen vanaf API
async function loadTechAnalysis() {
    setText("techStatus", "📡 Laden...");
    const timeframe = document.getElementById("globalTimeframe")?.value || "4hr";
    const apiUrl = `${baseUrl}?timeframe=${timeframe}`;

    try {
        let data = await safeFetch(apiUrl);
        if (!data || !Array.isArray(data)) throw new Error("Ongeldige API-response");

        console.log(`📊 Ontvangen technische analyse data (${timeframe}):`, data);
        renderTechTable(data);
        setText("techStatus", "✅ Data up-to-date");
    } catch (error) {
        showError("techStatus", "❌ Fout bij laden.");
    }
}

// ✅ Tabel renderen
function renderTechTable(assets) {
    const tbody = document.querySelector("#analysisTable tbody");
    tbody.innerHTML = "";

    let totalScore = 0;

    assets.forEach(asset => {
        const row = document.createElement("tr");
        row.dataset.id = asset.id;

        const score = calculateTechScore(asset);
        totalScore += score;

        const trend = score >= 1 ? "Bullish 📈" : score <= -1 ? "Bearish 📉" : "Neutraal ⚖️";

        row.innerHTML = `
            <td>${asset.symbol}</td>
            <td>${asset.rsi.toFixed(2)}</td>
            <td>${formatNumber(asset.volume)}</td>
            <td>${formatNumber(asset.ma_200)}</td>
            <td class="tech-score">${score}</td>
            <td>${trend}</td>
            <td><button class="btn-remove">❌</button></td>
        `;
        tbody.appendChild(row);
    });

    updateScoreSummary(totalScore, assets.length);
    attachDeleteEventListeners();
}

// ✅ Technische score berekenen
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

// ✅ Score samenvatting
function updateScoreSummary(total, count) {
    const avg = count > 0 ? (total / count).toFixed(1) : "N/A";
    document.getElementById("totalTechScore").innerText = avg;

    let advice = "Neutraal ⚖️";
    if (avg >= 1.5) advice = "Bullish 🟢";
    else if (avg <= -1.5) advice = "Bearish 🔴";

    document.getElementById("technicalAdvice").innerText = advice;
}

// ✅ Asset toevoegen
async function addTechRow() {
    const name = prompt("Voer de naam van de asset in:");
    if (!name || name.trim() === "") return alert("⚠️ Ongeldige naam!");

    await updateButton("addTechAssetBtn", "⏳ Toevoegen...", async () => {
        await safeFetch(baseUrl, "POST", { symbol: name.trim() });
        loadTechAnalysis();
    });
}

// ✅ Indicator toevoegen
async function addTechIndicator() {
    const name = prompt("Voer de naam van de indicator in:");
    if (!name || name.trim() === "") return alert("⚠️ Ongeldige naam!");

    await updateButton("addTechnicalIndicatorBtn", "⏳ Toevoegen...", async () => {
        await safeFetch(`${baseUrl}/indicators`, "POST", { name: name.trim() });
        loadTechAnalysis();
    });
}

// ✅ Asset verwijderen
async function removeTechRow(assetId) {
    if (!confirm("Weet je zeker dat je deze asset wilt verwijderen?")) return;

    await updateButton(`remove-${assetId}`, "⏳ Verwijderen...", async () => {
        await safeFetch(`${baseUrl}/${assetId}`, "DELETE");
        loadTechAnalysis();
    });
}

// ✅ API-call met retry
async function safeFetch(url, method = "GET", body = null) {
    let retries = 3;
    while (retries > 0) {
        try {
            const options = { method, headers: { "Content-Type": "application/json" } };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`Serverfout (${res.status})`);
            return method === "GET" ? await res.json() : true;
        } catch (err) {
            console.error(`❌ Fout bij ${url}:`, err);
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// ✅ UI helpers
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showError(id, message) {
    setText(id, message);
    document.getElementById(id).style.color = "red";
}

async function updateButton(id, tempText, action) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const original = btn.textContent;

    btn.textContent = tempText;
    btn.disabled = true;

    try {
        await action();
    } finally {
        btn.textContent = original;
        btn.disabled = false;
    }
}

function attachDeleteEventListeners() {
    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.removeEventListener("click", handleDeleteClick);
        btn.addEventListener("click", handleDeleteClick);
    });
}

function handleDeleteClick(e) {
    const assetId = e.target.closest("tr").dataset.id;
    if (assetId) removeTechRow(assetId);
}

function formatNumber(num) {
    return num >= 1e9
        ? `${(num / 1e9).toFixed(2)}B`
        : num >= 1e6
        ? `${(num / 1e6).toFixed(2)}M`
        : num.toFixed(2);
}
