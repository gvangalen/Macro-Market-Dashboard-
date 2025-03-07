document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    loadTechAnalysis(); // Laad bestaande analyses van AWS
});

const apiUrl = "http://13.60.235.90:5003/technical_analysis"; // ✅ AWS API endpoint

// ✅ **Technische Analyse laden vanaf AWS**
async function loadTechAnalysis() {
    try {
        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Fout bij ophalen technische analyse");
        let data = await response.json();
        console.log("📊 Ontvangen technische analyse data:", data);
        renderTechTable(data);
    } catch (error) {
        console.error("❌ Fout bij laden technische analyse:", error);
        document.getElementById("techStatus").textContent = "❌ Fout bij laden.";
    }
}

// ✅ **Tabel vullen met data**
function renderTechTable(data) {
    let tableBody = document.querySelector("#analysisTable tbody");
    tableBody.innerHTML = ""; // ❌ Oude rijen verwijderen

    data.assets.forEach(asset => {
        let newRow = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.innerText = asset.name;
        newRow.appendChild(nameCell);

        asset.indicators.forEach(indicator => {
            let indicatorCell = document.createElement("td");
            indicatorCell.innerText = indicator.value;
            newRow.appendChild(indicatorCell);
        });

        let deleteCell = document.createElement("td");
        deleteCell.innerHTML = `<button class="btn-remove" onclick="removeTechRow('${asset.id}', this)">❌</button>`;
        newRow.appendChild(deleteCell);

        tableBody.appendChild(newRow);
    });

    document.getElementById("techStatus").textContent = "✅ Data up-to-date";
}

// ✅ **Asset toevoegen met bestaande indicatoren**
async function addTechRow() {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName || assetName.trim() === "") return alert("⚠️ Ongeldige naam!");

    let button = document.getElementById("addTechAssetBtn");
    button.textContent = "⏳ Toevoegen...";

    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: assetName.trim(), indicators: [] })
        });

        if (!response.ok) throw new Error("Fout bij toevoegen asset");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Asset toevoegen mislukt:", error);
    } finally {
        button.textContent = "➕ Asset Toevoegen";
    }
}

// ✅ **Indicator toevoegen aan alle assets**
async function addTechIndicator() {
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName || indicatorName.trim() === "") return alert("⚠️ Ongeldige naam!");

    let button = document.getElementById("addTechnicalIndicatorBtn");
    button.textContent = "⏳ Toevoegen...";

    try {
        let response = await fetch(`${apiUrl}/indicators`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: indicatorName.trim() })
        });

        if (!response.ok) throw new Error("Fout bij toevoegen indicator");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Indicator toevoegen mislukt:", error);
    } finally {
        button.textContent = "➕ Indicator Toevoegen";
    }
}

// ✅ **Indicator verwijderen**
async function removeTechIndicator(button) {
    let indicatorName = button.parentNode.textContent.trim();
    if (!confirm(`Weet je zeker dat je '${indicatorName}' wilt verwijderen?`)) return;

    button.textContent = "⏳ Verwijderen...";

    try {
        let response = await fetch(`${apiUrl}/indicators/${indicatorName}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Fout bij verwijderen indicator");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Indicator verwijderen mislukt:", error);
    } finally {
        button.textContent = "❌";
    }
}

// ✅ **Asset verwijderen**
async function removeTechRow(assetId, button) {
    if (!confirm("Weet je zeker dat je deze asset wilt verwijderen?")) return;

    button.textContent = "⏳ Verwijderen...";
    try {
        let response = await fetch(`${apiUrl}/${assetId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Fout bij verwijderen asset");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Asset verwijderen mislukt:", error);
    } finally {
        button.textContent = "❌";
    }
}
