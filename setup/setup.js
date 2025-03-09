import { API_BASE_URL } from "../config.js"; // ✅ API-config ophalen

console.log("✅ setup.js geladen!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Setup Manager geladen!");
    loadSetups();
});

const apiUrl = `${API_BASE_URL}/setups`; // ✅ Gebruik centrale API-config

// ✅ **Setup toevoegen**
document.getElementById("setupForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    let name = document.getElementById("setupName")?.value.trim();
    let indicators = document.getElementById("setupIndicators")?.value.trim();
    let trend = document.getElementById("setupTrend")?.value;

    if (!name || !indicators || !trend) {
        showError("⚠️ Vul alle velden in!");
        return;
    }

    let setup = { name, indicators, trend };
    setText("setupStatus", "📡 Opslaan...");

    try {
        await safeFetch(apiUrl, "POST", setup);
        document.getElementById("setupForm").reset();
        loadSetups();
    } catch (error) {
        showError("❌ Setup opslaan mislukt.");
    }
});

// ✅ **Setup laden vanaf server**
async function loadSetups() {
    setText("setupStatus", "📡 Laden...");

    try {
        let setups = await safeFetch(apiUrl);
        if (!setups || setups.length === 0) {
            setText("setupList", "<li>🚫 Geen setups opgeslagen</li>", true);
            return;
        }

        let list = document.getElementById("setupList");
        if (!list) return;

        list.innerHTML = setups.map(setup => `
            <li data-id="${setup.id}">
                <span><strong>${setup.name}</strong> (${setup.trend}) - ${setup.indicators}</span>
                <button class="delete-btn">❌</button>
            </li>
        `).join("");

        attachDeleteEventListeners();
        setText("setupStatus", "✅ Setups geladen.");
    } catch (error) {
        showError("❌ Fout bij laden setups.");
    }
}

// ✅ **Setup verwijderen**
async function deleteSetup(id) {
    if (!confirm("Weet je zeker dat je deze setup wilt verwijderen?")) return;

    try {
        await safeFetch(`${apiUrl}/${id}`, "DELETE");
        loadSetups(); // ✅ Automatisch lijst verversen
    } catch (error) {
        showError("❌ Setup verwijderen mislukt.");
    }
}

// ✅ **Veilige API-aanvragen met retry**
async function safeFetch(url, method = "GET", body = null) {
    let retries = 3;
    while (retries > 0) {
        try {
            let options = {
                method,
                headers: { "Content-Type": "application/json" },
            };
            if (body) options.body = JSON.stringify(body);

            let response = await fetch(url, options);
            if (!response.ok) throw new Error(`Serverfout (${response.status})`);

            return method === "GET" ? await response.json() : true;
        } catch (error) {
            console.error(`❌ API-fout bij ${url}:`, error);
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000)); // ✅ 2 sec wachten
        }
    }
}

// ✅ **Tekst aanpassen in UI**
function setText(elementId, text, isHTML = false) {
    let el = document.getElementById(elementId);
    if (el) isHTML ? (el.innerHTML = text) : (el.textContent = text);
}

// ✅ **Foutmelding in UI tonen**
function showError(message) {
    setText("setupStatus", message);
    let statusEl = document.getElementById("setupStatus");
    if (statusEl) statusEl.style.color = "red";
}

// ✅ **Event Listeners voor verwijderen koppelen**
function attachDeleteEventListeners() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.removeEventListener("click", handleDeleteClick); // ✅ Voorkomt dubbele listeners
        button.addEventListener("click", handleDeleteClick);
    });
}

// ✅ **Afhandelen van verwijderen**
function handleDeleteClick(event) {
    let setupId = event.target.closest("li").dataset.id;
    if (setupId) deleteSetup(setupId);
}
