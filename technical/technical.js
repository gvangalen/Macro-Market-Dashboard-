document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Technische Analyse geladen!");
    loadTechAnalysis(); // Laad bestaande analyses van AWS
});

const apiUrl = "http://13.60.235.90:5003/technical_analysis"; // AWS API endpoint

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
    }
}

// ✅ **Tabel vullen met data**
function renderTechTable(data) {
    let tableBody = document.getElementById("analysisTable").getElementsByTagName("tbody")[0];
    let headerRow = document.getElementById("analysisTable").getElementsByTagName("thead")[0].rows[0];
    tableBody.innerHTML = "";

    data.assets.forEach(asset => {
        let newRow = tableBody.insertRow();
        newRow.insertCell(0).innerText = asset.name;
        
        asset.indicators.forEach(indicator => {
            let newCell = newRow.insertCell(-1);
            newCell.innerText = indicator.value;
        });
        
        let deleteCell = newRow.insertCell(-1);
        deleteCell.innerHTML = `<button class="btn-remove" onclick="removeTechRow('${asset.id}')">❌</button>`;
    });
}

// ✅ **Asset toevoegen met bestaande indicatoren**
window.addTechRow = async function () {
    let assetName = prompt("Voer de naam van de asset in:");
    if (!assetName) return;

    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: assetName, indicators: [] })
        });
        if (!response.ok) throw new Error("Fout bij toevoegen asset");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Asset toevoegen mislukt:", error);
    }
};

// ✅ **Indicator toevoegen aan alle assets**
window.addTechIndicator = async function () {
    let indicatorName = prompt("Voer de naam van de indicator in:");
    if (!indicatorName) return;
    
    try {
        let response = await fetch(`${apiUrl}/indicators`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: indicatorName })
        });
        if (!response.ok) throw new Error("Fout bij toevoegen indicator");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Indicator toevoegen mislukt:", error);
    }
};

// ✅ **Indicator verwijderen**
window.removeTechIndicator = async function (button) {
    let indicatorName = button.parentNode.textContent.trim();
    
    try {
        let response = await fetch(`${apiUrl}/indicators/${indicatorName}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Fout bij verwijderen indicator");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Indicator verwijderen mislukt:", error);
    }
};

// ✅ **Asset verwijderen**
window.removeTechRow = async function (assetId) {
    try {
        let response = await fetch(`${apiUrl}/${assetId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Fout bij verwijderen asset");
        loadTechAnalysis();
    } catch (error) {
        console.error("❌ Asset verwijderen mislukt:", error);
    }
};
