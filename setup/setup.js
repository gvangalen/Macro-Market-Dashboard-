document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ setup.js geladen!");
    loadSetups(); // ✅ Laad bestaande setups bij het starten
});

const apiUrl = "http://13.60.235.90:5002/setups"; // ✅ AWS API-endpoint

// ✅ **Setup toevoegen**
document.getElementById("setupForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    let name = document.getElementById("setupName")?.value.trim();
    let indicators = document.getElementById("setupIndicators")?.value.trim();
    let trend = document.getElementById("setupTrend")?.value;

    if (!name || !indicators || !trend) {
        alert("⚠️ Vul alle velden in!");
        return;
    }

    let setup = { name, indicators, trend };

    try {
        await saveSetup(setup);
        document.getElementById("setupForm").reset();
        loadSetups();
    } catch (error) {
        console.error("❌ Setup opslaan mislukt:", error);
    }
});

// ✅ **Setup opslaan op AWS-server**
async function saveSetup(setup) {
    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(setup)
        });

        if (!response.ok) throw new Error(`Serverfout (${response.status}): Setup niet opgeslagen.`);
        
        console.log("✅ Setup succesvol opgeslagen:", setup);
    } catch (error) {
        console.error("❌ Fout bij opslaan setup:", error);
        alert("❌ Setup opslaan mislukt. Controleer je verbinding.");
    }
}

// ✅ **Setups laden van AWS-server**
async function loadSetups() {
    try {
        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Serverfout (${response.status}): Setups niet geladen.`);
        
        let setups = await response.json();
        let list = document.getElementById("setupList");

        if (!list) return;

        list.innerHTML = setups.length === 0 
            ? "<li>🚫 Geen setups opgeslagen</li>"
            : setups.map(setup => `
                <li>
                    <span><strong>${setup.name}</strong> (${setup.trend}) - ${setup.indicators}</span>
                    <button class="delete-btn" onclick="deleteSetup('${setup.id}')">❌</button>
                </li>
            `).join("");

        console.log("✅ Setups succesvol geladen:", setups);
    } catch (error) {
        console.error("❌ Fout bij laden setups:", error);
        alert("❌ Setup laden mislukt. Controleer je verbinding.");
    }
}

// ✅ **Setup verwijderen op AWS-server**
async function deleteSetup(id) {
    if (!confirm("Weet je zeker dat je deze setup wilt verwijderen?")) return;

    try {
        let response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Serverfout (${response.status}): Setup niet verwijderd.`);

        console.log(`✅ Setup ${id} succesvol verwijderd.`);
        loadSetups(); // ✅ Automatisch lijst verversen
    } catch (error) {
        console.error("❌ Fout bij verwijderen setup:", error);
        alert("❌ Setup verwijderen mislukt. Controleer je verbinding.");
    }
}
