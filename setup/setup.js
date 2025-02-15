document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ setup.js geladen!");
    loadSetups(); // Laad bestaande setups bij het starten
});

const apiUrl = "http://13.60.235.90:5002/setups"; // AWS API endpoint

// ✅ **Setup toevoegen**
document.getElementById("setupForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let name = document.getElementById("setupName").value.trim();
    let indicators = document.getElementById("setupIndicators").value.trim();
    let trend = document.getElementById("setupTrend").value;

    if (!name || !indicators) {
        alert("⚠️ Vul alle velden in!");
        return;
    }

    let setup = { name, indicators, trend };
    await saveSetup(setup);
    document.getElementById("setupForm").reset();
});

// ✅ **Setup opslaan op AWS-server**
async function saveSetup(setup) {
    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(setup)
        });
        
        if (!response.ok) throw new Error("Fout bij opslaan setup");
        loadSetups();
    } catch (error) {
        console.error("❌ Setup opslaan mislukt:", error);
    }
}

// ✅ **Setups laden van AWS-server**
async function loadSetups() {
    try {
        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Fout bij ophalen setups");
        
        let setups = await response.json();
        let list = document.getElementById("setupList");
        list.innerHTML = "";

        if (setups.length === 0) {
            list.innerHTML = "<li>🚫 Geen setups opgeslagen</li>";
            return;
        }

        setups.forEach((setup) => {
            let li = document.createElement("li");
            li.innerHTML = `
                <span><strong>${setup.name}</strong> (${setup.trend}) - ${setup.indicators}</span>
                <button class="delete-btn" onclick="deleteSetup('${setup.id}')">❌</button>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("❌ Setup laden mislukt:", error);
    }
}

// ✅ **Setup verwijderen op AWS-server**
async function deleteSetup(id) {
    try {
        let response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Fout bij verwijderen setup");
        loadSetups();
    } catch (error) {
        console.error("❌ Setup verwijderen mislukt:", error);
    }
}
