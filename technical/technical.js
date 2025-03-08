import { API_BASE_URL } from "../config.js"; // ✅ API-config ophalen

console.log("✅ technical.js geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    loadTechAnalysis();
});

const apiUrl = `${API_BASE_URL}/technical_analysis`;

// ✅ **Technische Analyse laden vanaf AWS**
async function loadTechAnalysis() {
    setText("techStatus", "📡 Laden...");

    try {
        let data = await safeFetch(apiUrl);
        if (!data || !data.assets) throw new Error("Ongeldige API-response");

        console.log("📊 Ontvangen technische analyse data:", data);
        renderTechTable(data.assets);
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

        newRow.innerHTML = `
            <td>${asset.name}</td>
            ${asset.indicators.map(indicator => `<td>${indicator.value}</td>`).join("")}
            <td><button class="btn-remove">❌</button></td>
        `;

        tableBody.appendChild(newRow);
    });

    attachDeleteEventListeners();
}

// ✅ **Asset toevoegen met indicatoren**
async function addTechRow() {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName || assetName.trim() === "") return alert("⚠️ Ongeldige naam!");

    await updateButton("addTechAssetBtn", "⏳ Toevoegen...", async () => {
        await safeFetch(apiUrl, "POST", { name: assetName.trim(), indicators: [] });
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
