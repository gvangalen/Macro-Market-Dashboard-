document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ setup.js geladen!");
    loadSetups(); // Laad bestaande setups
});

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

function saveSetup(setup) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    if (setups.length >= 5) {
        alert("⚠️ Maximaal 5 setups toegestaan!");
        return;
    }
    setups.push(setup);
    localStorage.setItem("setups", JSON.stringify(setups));
    loadSetups();
}

function loadSetups() {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    let list = document.getElementById("setupList");
    list.innerHTML = "";

    setups.forEach((setup, index) => {
        let li = document.createElement("li");
        li.innerHTML = `${setup.name} (${setup.trend}) 
                        <button onclick="deleteSetup(${index})">❌</button>`;
        list.appendChild(li);
    });
}

function deleteSetup(index) {
    let setups = JSON.parse(localStorage.getItem("setups")) || [];
    setups.splice(index, 1);
    localStorage.setItem("setups", JSON.stringify(setups));
    loadSetups();
}
