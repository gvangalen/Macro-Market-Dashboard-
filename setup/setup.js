document.addEventListener("DOMContentLoaded", function () {
    const setupForm = document.getElementById("setupForm");
    const setupList = document.getElementById("setupList");
    let setups = JSON.parse(localStorage.getItem("setups")) || [];

    function renderSetups() {
        setupList.innerHTML = "";
        setups.forEach((setup, index) => {
            const li = document.createElement("li");
            li.textContent = `${setup.name} - ${setup.indicators} - ${setup.trend}`;
            
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Verwijderen";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.onclick = () => deleteSetup(index);
            
            li.appendChild(deleteBtn);
            setupList.appendChild(li);
        });
    }

    function deleteSetup(index) {
        setups.splice(index, 1);
        localStorage.setItem("setups", JSON.stringify(setups));
        renderSetups();
    }

    setupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const setupName = document.getElementById("setupName").value;
        const indicators = document.getElementById("indicators").value;
        const trend = document.getElementById("trend").value;

        const newSetup = { name: setupName, indicators, trend };
        setups.push(newSetup);
        localStorage.setItem("setups", JSON.stringify(setups));
        setupForm.reset();
        renderSetups();
    });

    renderSetups();
});

