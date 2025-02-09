document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ setup.js geladen!");
    loadSetups(); // Laad bestaande setups bij het starten
});

// ✅ **Setup toevoegen**
document.getElementById("setupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("setupName").value.trim();
    let indicators = document.getElementById("setupIndicators").value.trim();
    let trend = document.getElementById("setupTrend").value;

    if (!name || !indicators) {
        alert("⚠️ Vul alle velden in!");
        return;
    }

    let setup = { name, indicators, trend };
    saveSetup(setup);
    document.getElementById("setupForm").reset();
});

// ✅ **Setup opslaan in LocalStorage**
function saveSetup(setup) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];

    // ✅ Controleer of setup al bestaat
    if (setups.some(s => s.name.toLowerCase() === setup.name.toLowerCase())) {
        alert("⚠️ Deze setup bestaat al!");
        return;
    }

    if (setups.length >= 5) {
        alert("⚠️ Maximaal 5 setups toegestaan!");
        return;
    }

    setups.push(setup);
    localStorage.setItem("setups", JSON.stringify(setups));
    loadSetups();
}

// ✅ **Setups laden en tonen in de lijst**
function loadSetups() {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let list = document.getElementById("setupList");
    list.innerHTML = "";

    if (setups.length === 0) {
        list.innerHTML = "<li>🚫 Geen setups opgeslagen</li>";
        return;
    }

    setups.forEach((setup, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${setup.name}</strong> (${setup.trend}) - ${setup.indicators}</span>
            <button class="delete-btn" onclick="deleteSetup(${index})">❌</button>
        `;
        list.appendChild(li);
    });
}

// ✅ **Setup verwijderen**
function deleteSetup(index) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    setups.splice(index, 1);
    localStorage.setItem("setups", JSON.stringify(setups));
    loadSetups();
}
